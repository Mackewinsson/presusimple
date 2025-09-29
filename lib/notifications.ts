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

export interface NotificationResult {
  success: boolean;
  sent: number;
  failed: number;
  errors: string[];
}

/**
 * Send notification to a single user
 */
export async function sendNotificationToUser(
  subscription: any,
  payload: NotificationPayload
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('🚀 Initializing web-push...');
    if (!initializeWebPush()) {
      console.error('❌ Web-push initialization failed');
      return { success: false, error: 'Web-push not initialized' };
    }
    console.log('✅ Web-push initialized successfully');

    const notificationPayload = JSON.stringify(buildWebPushPayload(payload));
    console.log('📤 Sending notification with payload:', notificationPayload);
    
    await webpush.sendNotification(subscription, notificationPayload);
    console.log('✅ Notification sent successfully');
    
    return { success: true };
  } catch (error: any) {
    console.error('❌ Error sending notification:', error);
    console.error('❌ Error details:', {
      message: error.message,
      statusCode: error.statusCode,
      headers: error.headers,
    });
    
    // Handle specific web-push errors
    if (error.statusCode === 410) {
      return { success: false, error: 'Subscription expired' };
    } else if (error.statusCode === 404) {
      return { success: false, error: 'Subscription not found' };
    } else if (error.statusCode === 413) {
      return { success: false, error: 'Payload too large' };
    }
    
    return { success: false, error: error.message || 'Unknown error' };
  }
}

/**
 * Send notification to multiple users
 */
export async function sendNotificationToUsers(
  subscriptions: any[],
  payload: NotificationPayload
): Promise<NotificationResult> {
  const result: NotificationResult = {
    success: true,
    sent: 0,
    failed: 0,
    errors: [],
  };

  if (!initializeWebPush()) {
    result.success = false;
    result.errors.push('Web-push not initialized');
    return result;
  }

  // Send notifications in parallel with a reasonable concurrency limit
  const concurrencyLimit = 10;
  const chunks = [];
  
  for (let i = 0; i < subscriptions.length; i += concurrencyLimit) {
    chunks.push(subscriptions.slice(i, i + concurrencyLimit));
  }

  for (const chunk of chunks) {
    const promises = chunk.map(async (subscription) => {
      const notificationResult = await sendNotificationToUser(subscription, payload);
      
      if (notificationResult.success) {
        result.sent++;
      } else {
        result.failed++;
        result.errors.push(notificationResult.error || 'Unknown error');
      }
    });

    await Promise.all(promises);
  }

  result.success = result.failed === 0;
  return result;
}

/**
 * Send test notification
 */
export async function sendTestNotification(
  subscription: any,
  customMessage?: string
): Promise<{ success: boolean; error?: string }> {
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
