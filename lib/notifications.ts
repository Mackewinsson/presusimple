/**
 * Notification Service
 * Handles sending push notifications to users
 */

import webpush from 'web-push';
import { getVAPIDPrivateKey, getVAPIDSubject, validateVAPIDConfig } from './vapid';

// Initialize web-push with VAPID keys
export function initializeWebPush(): boolean {
  console.log('🔧 Validating VAPID configuration...');
  if (!validateVAPIDConfig()) {
    console.error('❌ VAPID configuration validation failed');
    return false;
  }
  console.log('✅ VAPID configuration is valid');

  try {
    console.log('🔧 Setting VAPID details...');
    console.log('📧 Subject:', getVAPIDSubject());
    console.log('🔑 Public Key:', process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ? 'Set' : 'Missing');
    console.log('🔐 Private Key:', process.env.VAPID_PRIVATE_KEY ? 'Set' : 'Missing');
    
    webpush.setVapidDetails(
      getVAPIDSubject(),
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
      getVAPIDPrivateKey()
    );
    console.log('✅ VAPID details set successfully');
    return true;
  } catch (error) {
    console.error('❌ Error initializing web-push:', error);
    return false;
  }
}

export interface NotificationAction {
  action: string;
  title: string;
  icon?: string;
  url?: string;
}

export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  url?: string;
  defaultActionUrl?: string;
  data?: Record<string, any>;
  actions?: NotificationAction[];
  requireInteraction?: boolean;
  silent?: boolean;
  tag?: string;
  renotify?: boolean;
  vibrate?: number[];
  mutable?: boolean;
  appBadge?: number;
}

export function buildWebPushPayload(payload: NotificationPayload) {
  const {
    title,
    body,
    icon = '/icons/icon-192x192.png',
    badge = '/icons/icon-72x72.png',
    url = '/',
    defaultActionUrl,
    data = {},
    actions = [],
    requireInteraction = false,
    silent = false,
    tag,
    renotify = false,
    vibrate,
    mutable = true,
    appBadge,
  } = payload;

  const resolvedDefaultUrl = defaultActionUrl ?? url;

  const actionUrlMap = actions.reduce<Record<string, string>>((map, current) => {
    if (current.action) {
      map[current.action] = current.url ?? resolvedDefaultUrl;
    }
    return map;
  }, {});

  const baseActions = actions.map(({ action, title, icon }) => ({
    action,
    title,
    ...(icon ? { icon } : {}),
  }));

  const declarativeActions = actions.map(({ action, title, icon, url }) => ({
    action,
    title,
    ...(icon ? { icon } : {}),
    ...(url || resolvedDefaultUrl ? { url: url ?? resolvedDefaultUrl } : {}),
  }));

  const mergedData = {
    ...data,
    url,
    defaultActionUrl: resolvedDefaultUrl,
    actionUrls: actionUrlMap,
  };

  const basePayload = {
    title,
    body,
    icon,
    badge,
    url,
    data: mergedData,
    actions: baseActions,
    requireInteraction,
    silent,
    ...(tag ? { tag } : {}),
    ...(renotify ? { renotify } : {}),
    ...(vibrate ? { vibrate } : {}),
  };

  const declarativePayload = {
    default_action_url: resolvedDefaultUrl,
    mutable,
    options: {
      body,
      icon,
      badge,
      data: mergedData,
      actions: declarativeActions,
      requireInteraction,
      silent,
      ...(tag ? { tag } : {}),
      ...(renotify ? { renotify } : {}),
      ...(vibrate ? { vibrate } : {}),
    },
    ...(typeof appBadge === 'number' ? { app_badge: appBadge } : {}),
  };

  return {
    ...basePayload,
    ...declarativePayload,
  };
}

/**
 * Status codes from the push service that mean the stored subscription can
 * never be delivered to again and must be recreated by the client:
 * - 404/410: subscription expired or unsubscribed
 * - 403: subscription was created with different VAPID keys (e.g. an
 *   environment with mismatched keys wrote to the shared database)
 */
const STALE_SUBSCRIPTION_STATUS_CODES = [403, 404, 410];

export function isStaleSubscriptionError(statusCode?: number): boolean {
  return (
    statusCode !== undefined &&
    STALE_SUBSCRIPTION_STATUS_CODES.includes(statusCode)
  );
}

export interface NotificationResult {
  success: boolean;
  sent: number;
  failed: number;
  errors: string[];
}

export interface NotificationFailure {
  userId: string;
  error: string;
  statusCode?: number;
}

export interface NotificationBatchResult extends NotificationResult {
  failures: NotificationFailure[];
}

export interface NotificationRecipient {
  userId: string;
  subscription: Record<string, unknown>;
}

async function sendRawNotification(
  subscription: Record<string, unknown>,
  payload: NotificationPayload
): Promise<{ success: boolean; error?: string; statusCode?: number }> {
  try {
    const notificationPayload = JSON.stringify(buildWebPushPayload(payload));
    await webpush.sendNotification(
      subscription as unknown as webpush.PushSubscription,
      notificationPayload
    );
    return { success: true };
  } catch (error: unknown) {
    const err = error as { message?: string; statusCode?: number };
    console.error("Error sending notification:", err);

    if (err.statusCode === 410) {
      return { success: false, error: "Subscription expired", statusCode: 410 };
    }
    if (err.statusCode === 404) {
      return { success: false, error: "Subscription not found", statusCode: 404 };
    }
    if (err.statusCode === 403) {
      return {
        success: false,
        error: "Subscription created with different VAPID keys",
        statusCode: 403,
      };
    }
    if (err.statusCode === 413) {
      return { success: false, error: "Payload too large", statusCode: 413 };
    }

    return {
      success: false,
      error: err.message || "Unknown error",
      statusCode: err.statusCode,
    };
  }
}

export interface NotificationSendResult {
  success: boolean;
  error?: string;
  statusCode?: number;
}

/**
 * Send notification to a single user
 */
export async function sendNotificationToUser(
  subscription: Record<string, unknown>,
  payload: NotificationPayload
): Promise<NotificationSendResult> {
  if (!initializeWebPush()) {
    return { success: false, error: "Web-push not initialized" };
  }

  return sendRawNotification(subscription, payload);
}

/**
 * Send notification to multiple users with per-recipient failure metadata.
 */
export async function sendNotificationToRecipients(
  recipients: NotificationRecipient[],
  payload: NotificationPayload
): Promise<NotificationBatchResult> {
  const result: NotificationBatchResult = {
    success: true,
    sent: 0,
    failed: 0,
    errors: [],
    failures: [],
  };

  if (!initializeWebPush()) {
    result.success = false;
    result.errors.push("Web-push not initialized");
    return result;
  }

  const concurrencyLimit = 10;
  const chunks: NotificationRecipient[][] = [];

  for (let i = 0; i < recipients.length; i += concurrencyLimit) {
    chunks.push(recipients.slice(i, i + concurrencyLimit));
  }

  for (const chunk of chunks) {
    await Promise.all(
      chunk.map(async ({ userId, subscription }) => {
        const notificationResult = await sendRawNotification(subscription, payload);

        if (notificationResult.success) {
          result.sent++;
          return;
        }

        result.failed++;
        const errorMessage = notificationResult.error || "Unknown error";
        result.errors.push(errorMessage);
        result.failures.push({
          userId,
          error: errorMessage,
          statusCode: notificationResult.statusCode,
        });
      })
    );
  }

  result.success = result.failed === 0;
  return result;
}

/**
 * @deprecated Use sendNotificationToRecipients for broadcasts.
 */
export async function sendNotificationToUsers(
  subscriptions: Record<string, unknown>[],
  payload: NotificationPayload
): Promise<NotificationResult> {
  const recipients = subscriptions.map((subscription, index) => ({
    userId: String(index),
    subscription,
  }));
  const batchResult = await sendNotificationToRecipients(recipients, payload);
  return {
    success: batchResult.success,
    sent: batchResult.sent,
    failed: batchResult.failed,
    errors: batchResult.errors,
  };
}

/**
 * Send test notification
 */
export async function sendTestNotification(
  subscription: Record<string, unknown>,
  customMessage?: string
): Promise<NotificationSendResult> {
  console.log('🧪 Sending test notification...');
  console.log('📱 Subscription:', subscription ? 'Valid' : 'Invalid');
  
  const payload: NotificationPayload = {
    title: 'Test Notification',
    body: customMessage || 'This is a test notification from your Budget App!',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    url: '/dev-tools',
    defaultActionUrl: '/dev-tools',
    data: {
      type: 'test',
      timestamp: Date.now(),
    },
    actions: [
      {
        action: 'view',
        title: 'View App',
        url: '/dev-tools',
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
      },
    ],
    // Unique tag + renotify so repeated test sends always pop up instead of
    // silently replacing the previous notification with the same tag
    tag: `test-${Date.now()}`,
    renotify: true,
    mutable: true,
  };

  console.log('📦 Payload:', payload);
  return sendNotificationToUser(subscription, payload);
}

/**
 * Send budget alert notification
 */
export async function sendBudgetAlertNotification(
  subscription: any,
  budgetInfo: {
    category: string;
    spent: number;
    limit: number;
    percentage: number;
  }
): Promise<{ success: boolean; error?: string }> {
  const payload: NotificationPayload = {
    title: 'Budget Alert',
    body: `You've spent ${budgetInfo.percentage}% of your ${budgetInfo.category} budget ($${budgetInfo.spent}/${budgetInfo.limit})`,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    url: '/budget',
    defaultActionUrl: '/budget',
    data: {
      type: 'budget-alert',
      category: budgetInfo.category,
      spent: budgetInfo.spent,
      limit: budgetInfo.limit,
      percentage: budgetInfo.percentage,
      timestamp: Date.now(),
    },
    actions: [
      {
        action: 'view',
        title: 'View Budget',
        url: '/budget',
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
      },
    ],
    tag: `budget-alert-${budgetInfo.category}`,
    requireInteraction: budgetInfo.percentage >= 90,
    mutable: true,
  };

  return sendNotificationToUser(subscription, payload);
}

/**
 * Send expense reminder notification
 */
export async function sendExpenseReminderNotification(
  subscription: any,
  reminderType: 'daily' | 'weekly' | 'monthly'
): Promise<{ success: boolean; error?: string }> {
  const messages = {
    daily: 'Don\'t forget to log your expenses for today!',
    weekly: 'Time for your weekly expense review!',
    monthly: 'Monthly budget review time - how did you do?',
  };

  const payload: NotificationPayload = {
    title: 'Expense Reminder',
    body: messages[reminderType],
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    url: '/budget',
    defaultActionUrl: '/budget',
    data: {
      type: 'expense-reminder',
      reminderType,
      timestamp: Date.now(),
    },
    actions: [
      {
        action: 'view',
        title: 'Add Expense',
        url: '/budget',
      },
      {
        action: 'dismiss',
        title: 'Later',
      },
    ],
    tag: `expense-reminder-${reminderType}`,
    mutable: true,
  };

  return sendNotificationToUser(subscription, payload);
}
