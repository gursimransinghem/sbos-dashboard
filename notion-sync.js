/**
 * SBOS Notion API Sync Module
 *
 * Connects your SBOS dashboards to live Notion data via CORS proxy.
 * Since this runs client-side with no backend, you have two options:
 *
 * OPTION A: Use a CORS proxy (e.g., Cloudflare Worker - free tier)
 * OPTION B: Use Pipedream/Make.com webhook to bridge Notion API
 *
 * Setup:
 * 1. Create a Notion integration at https://www.notion.so/my-integrations
 * 2. Copy the Internal Integration Token
 * 3. Share your Notion databases with the integration
 * 4. Deploy one of the proxy options below
 * 5. Update NOTION_CONFIG with your proxy URL and database IDs
 */

const NOTION_CONFIG = {
  // Your CORS proxy URL (see setup instructions below)
  proxyUrl: '',

  // Your Notion database IDs (from the URL of each Notion database)
  databases: {
    tasks: '',       // Tasks Master database ID
    inbox: '',       // Quick Capture inbox database ID
    goals: '',       // Goals database ID
    decisions: '',   // Decision Log database ID
    finances: '',    // Finance tracker database ID
  },

  // Sync interval in milliseconds (default: 5 minutes)
  syncInterval: 5 * 60 * 1000,

  // Set to true once configured
  enabled: false,
};

/**
 * ══════════════════════════════════════════════
 * CLOUDFLARE WORKER PROXY (Option A - Recommended)
 * ══════════════════════════════════════════════
 *
 * Deploy this as a Cloudflare Worker (free tier: 100K requests/day):
 *
 * ```js
 * // cloudflare-worker.js
 * export default {
 *   async fetch(request, env) {
 *     const NOTION_TOKEN = env.NOTION_TOKEN; // Set in Worker secrets
 *
 *     if (request.method === 'OPTIONS') {
 *       return new Response(null, {
 *         headers: {
 *           'Access-Control-Allow-Origin': 'https://gursimransinghem.github.io',
 *           'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
 *           'Access-Control-Allow-Headers': 'Content-Type',
 *         }
 *       });
 *     }
 *
 *     const url = new URL(request.url);
 *     const notionPath = url.pathname.replace('/notion', '');
 *     const notionUrl = `https://api.notion.com/v1${notionPath}`;
 *
 *     const body = request.method === 'POST' ? await request.text() : undefined;
 *
 *     const response = await fetch(notionUrl, {
 *       method: request.method,
 *       headers: {
 *         'Authorization': `Bearer ${NOTION_TOKEN}`,
 *         'Notion-Version': '2022-06-28',
 *         'Content-Type': 'application/json',
 *       },
 *       body,
 *     });
 *
 *     const data = await response.text();
 *     return new Response(data, {
 *       status: response.status,
 *       headers: {
 *         'Content-Type': 'application/json',
 *         'Access-Control-Allow-Origin': 'https://gursimransinghem.github.io',
 *       }
 *     });
 *   }
 * };
 * ```
 *
 * Then set NOTION_CONFIG.proxyUrl = 'https://your-worker.your-subdomain.workers.dev/notion'
 */

// ═══════════════ NOTION API CLIENT ═══════════════

class NotionSync {
  constructor(config) {
    this.config = config;
    this.cache = {};
    this.lastSync = {};
    this.listeners = {};
  }

  isConfigured() {
    return this.config.enabled && this.config.proxyUrl;
  }

  async query(databaseId, filter = {}, sorts = []) {
    if (!this.isConfigured()) return null;
    try {
      const response = await fetch(`${this.config.proxyUrl}/databases/${databaseId}/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filter, sorts, page_size: 100 }),
      });
      if (!response.ok) throw new Error(`Notion API error: ${response.status}`);
      return await response.json();
    } catch (err) {
      console.error('[SBOS Notion Sync] Query failed:', err);
      return null;
    }
  }

  // ═══ DATA TRANSFORMERS ═══

  transformTasks(notionResults) {
    if (!notionResults?.results) return null;
    return notionResults.results.map((page, i) => ({
      id: i + 1,
      notionId: page.id,
      task: this.getTitle(page, 'Name') || this.getTitle(page, 'Task'),
      priority: this.getSelect(page, 'Priority') || 'P2',
      time: this.getRichText(page, 'Time Estimate') || '15 min',
      status: this.getSelect(page, 'Status') || 'Next Action',
      context: this.getSelect(page, 'Context') || '',
      firstStep: this.getRichText(page, 'First Step') || '',
      done: this.getCheckbox(page, 'Done') || this.getSelect(page, 'Status') === 'Done',
    }));
  }

  transformInbox(notionResults) {
    if (!notionResults?.results) return null;
    return notionResults.results.map((page, i) => ({
      id: i + 1,
      notionId: page.id,
      capture: this.getTitle(page, 'Name') || this.getTitle(page, 'Capture'),
      type: this.getSelect(page, 'Type') || 'Note',
      source: this.getSelect(page, 'Source') || 'Manual',
      status: this.getSelect(page, 'Status') || 'Unprocessed',
    }));
  }

  transformGoals(notionResults) {
    if (!notionResults?.results) return null;
    return notionResults.results.map((page, i) => ({
      goal: this.getTitle(page, 'Name') || this.getTitle(page, 'Goal'),
      area: this.getSelect(page, 'Area') || '',
      progress: this.getNumber(page, 'Progress') || 0,
      status: this.getSelect(page, 'Status') || 'Active',
      target: this.getRichText(page, 'Target Date') || '',
    }));
  }

  // ═══ PROPERTY HELPERS ═══

  getTitle(page, propName) {
    const prop = page.properties?.[propName];
    if (prop?.type === 'title') return prop.title?.[0]?.plain_text || '';
    return '';
  }

  getRichText(page, propName) {
    const prop = page.properties?.[propName];
    if (prop?.type === 'rich_text') return prop.rich_text?.[0]?.plain_text || '';
    return '';
  }

  getSelect(page, propName) {
    const prop = page.properties?.[propName];
    if (prop?.type === 'select') return prop.select?.name || '';
    return '';
  }

  getNumber(page, propName) {
    const prop = page.properties?.[propName];
    if (prop?.type === 'number') return prop.number || 0;
    return 0;
  }

  getCheckbox(page, propName) {
    const prop = page.properties?.[propName];
    if (prop?.type === 'checkbox') return prop.checkbox || false;
    return false;
  }

  // ═══ SYNC METHODS ═══

  async syncTasks() {
    const db = this.config.databases.tasks;
    if (!db) return null;
    const result = await this.query(db, {}, [{ property: 'Priority', direction: 'ascending' }]);
    return this.transformTasks(result);
  }

  async syncInbox() {
    const db = this.config.databases.inbox;
    if (!db) return null;
    const result = await this.query(db, {}, [{ timestamp: 'created_time', direction: 'descending' }]);
    return this.transformInbox(result);
  }

  async syncGoals() {
    const db = this.config.databases.goals;
    if (!db) return null;
    const result = await this.query(db);
    return this.transformGoals(result);
  }

  async syncAll() {
    if (!this.isConfigured()) return { tasks: null, inbox: null, goals: null };
    const [tasks, inbox, goals] = await Promise.all([
      this.syncTasks(),
      this.syncInbox(),
      this.syncGoals(),
    ]);
    this.lastSync = { timestamp: new Date().toISOString(), tasks: !!tasks, inbox: !!inbox, goals: !!goals };
    return { tasks, inbox, goals };
  }

  // Event system for React integration
  on(event, callback) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(callback);
  }

  emit(event, data) {
    (this.listeners[event] || []).forEach(cb => cb(data));
  }

  // Start periodic sync
  startAutoSync(onUpdate) {
    if (!this.isConfigured()) return null;
    const sync = async () => {
      const data = await this.syncAll();
      if (onUpdate) onUpdate(data);
      this.emit('sync', data);
    };
    sync(); // Initial sync
    return setInterval(sync, this.config.syncInterval);
  }
}

// ═══ SINGLETON INSTANCE ═══
const notionSync = new NotionSync(NOTION_CONFIG);

// Export for use in dashboard HTML files via <script> tag
window.SBOS_NOTION = {
  config: NOTION_CONFIG,
  sync: notionSync,

  // Quick setup helper
  configure(proxyUrl, databases) {
    NOTION_CONFIG.proxyUrl = proxyUrl;
    Object.assign(NOTION_CONFIG.databases, databases);
    NOTION_CONFIG.enabled = true;
    console.log('[SBOS] Notion sync configured. Call SBOS_NOTION.sync.syncAll() to test.');
  },
};
