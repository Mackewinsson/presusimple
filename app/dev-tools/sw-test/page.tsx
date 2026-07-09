'use client';

import { useState, useEffect, useCallback } from 'react';

interface TestStep {
  name: string;
  passed: boolean;
  detail: string;
}

interface TestResults {
  steps: TestStep[];
  overallPass: boolean;
  timestamp: string;
}

/**
 * Automated E2E test page for verifying the service worker registration
 * race condition fix. This page:
 * 1. Unregisters all existing service workers
 * 2. Waits for cleanup
 * 3. Registers a fresh service worker from scratch
 * 4. Checks registration.active immediately (demonstrates the race condition)
 * 5. Awaits navigator.serviceWorker.ready (the fix)
 * 6. Verifies PushManager is accessible
 * 7. Calls ensureServiceWorkerRegistered from our codebase
 * 8. Verifies it returns a valid registration with .active populated
 */
export default function ServiceWorkerTestPage() {
  const [results, setResults] = useState<TestResults | null>(null);
  const [running, setRunning] = useState(false);
  const [phase, setPhase] = useState('idle');

  const runTest = useCallback(async () => {
    setRunning(true);
    const steps: TestStep[] = [];

    try {
      // ─── Phase 1: Cleanup ───
      setPhase('Unregistering existing service workers...');
      const existingRegs = await navigator.serviceWorker.getRegistrations();
      for (const reg of existingRegs) {
        await reg.unregister();
      }
      steps.push({
        name: 'Cleanup: Unregister existing SWs',
        passed: true,
        detail: `Unregistered ${existingRegs.length} service worker(s)`,
      });

      // Brief wait for cleanup (short to stress-test race conditions)
      setPhase('Waiting for cleanup...');
      await new Promise((r) => setTimeout(r, 500));

      // Verify no SW is registered
      const postCleanup = await navigator.serviceWorker.getRegistration();
      steps.push({
        name: 'Verify: No SW registered after cleanup',
        passed: !postCleanup,
        detail: postCleanup
          ? `SW still registered: ${postCleanup.active?.state || 'no active'}`
          : 'Clean slate confirmed',
      });

      // ─── Phase 2: Raw registration (reproduce old bug) ───
      setPhase('Registering service worker from scratch...');
      const freshReg = await navigator.serviceWorker.register('/sw.js');
      steps.push({
        name: 'Register: navigator.serviceWorker.register(/sw.js)',
        passed: !!freshReg,
        detail: `Scope: ${freshReg.scope}`,
      });

      // Check registration.active IMMEDIATELY (the old buggy check)
      const immediateActive = freshReg.active;
      steps.push({
        name: 'Race condition check: registration.active immediately',
        passed: true, // informational - we expect this might be null
        detail: immediateActive
          ? `Active (state: ${immediateActive.state}) — no race condition on this run`
          : 'NULL — confirms race condition exists (old code would throw here)',
      });

      // ─── Phase 3: The fix - await navigator.serviceWorker.ready ───
      setPhase('Awaiting navigator.serviceWorker.ready (the fix)...');
      const readyReg = await navigator.serviceWorker.ready;
      steps.push({
        name: 'Fix: navigator.serviceWorker.ready resolved',
        passed: !!readyReg.active,
        detail: readyReg.active
          ? `Active worker state: ${readyReg.active.state}`
          : 'FAIL: Still no active worker after ready!',
      });

      // Verify the registration has .active populated
      steps.push({
        name: 'Verify: readyReg.active is populated',
        passed: readyReg.active?.state === 'activated' || readyReg.active?.state === 'activating',
        detail: `State: ${readyReg.active?.state || 'none'}`,
      });

      // ─── Phase 4: Test PushManager access ───
      setPhase('Testing PushManager access...');
      try {
        const pm = readyReg.pushManager;
        const existingSub = await pm.getSubscription();
        steps.push({
          name: 'PushManager: Accessible on ready registration',
          passed: !!pm,
          detail: existingSub
            ? `PushManager ready, existing subscription found`
            : `PushManager ready, no existing subscription`,
        });
      } catch (e: unknown) {
        steps.push({
          name: 'PushManager: Accessible on ready registration',
          passed: false,
          detail: `Error: ${e instanceof Error ? e.message : String(e)}`,
        });
      }

      // ─── Phase 5: Test ensureServiceWorkerRegistered from our codebase ───
      setPhase('Testing ensureServiceWorkerRegistered()...');

      // Unregister again to test our helper from scratch
      const regs2 = await navigator.serviceWorker.getRegistrations();
      for (const reg of regs2) await reg.unregister();
      await new Promise((r) => setTimeout(r, 500));

      // Dynamically import to avoid SSR issues
      const { ensureServiceWorkerRegistered } = await import(
        '@/lib/push-subscription'
      );
      const helperResult = await ensureServiceWorkerRegistered();
      steps.push({
        name: 'ensureServiceWorkerRegistered: Returns non-null',
        passed: !!helperResult,
        detail: helperResult
          ? `Returned registration with scope: ${helperResult.scope}`
          : 'FAIL: Returned null',
      });

      if (helperResult) {
        steps.push({
          name: 'ensureServiceWorkerRegistered: .active is populated',
          passed: !!helperResult.active,
          detail: helperResult.active
            ? `Active state: ${helperResult.active.state}`
            : 'FAIL: .active is null on returned registration',
        });

        // This is the critical test - the old code checked !registration?.active
        // which would fail here on first registration
        try {
          const pm2 = helperResult.pushManager;
          const sub2 = await pm2.getSubscription();
          steps.push({
            name: 'ensureServiceWorkerRegistered: PushManager works',
            passed: !!pm2,
            detail: `PushManager accessible (subscription: ${sub2 ? 'exists' : 'none'})`,
          });
        } catch (e: unknown) {
          steps.push({
            name: 'ensureServiceWorkerRegistered: PushManager works',
            passed: false,
            detail: `Error: ${e instanceof Error ? e.message : String(e)}`,
          });
        }
      }

      // ─── Phase 6: Verify second call also works (regression) ───
      setPhase('Testing second call to ensureServiceWorkerRegistered()...');
      const secondResult = await ensureServiceWorkerRegistered();
      steps.push({
        name: 'Second call: ensureServiceWorkerRegistered works',
        passed: !!secondResult?.active,
        detail: secondResult?.active
          ? `Active: ${secondResult.active.state}`
          : 'FAIL: Second call failed',
      });

      // ─── Phase 7: Rapid-fire stress test (the actual bug scenario) ───
      // Unregister everything and IMMEDIATELY call ensureServiceWorkerRegistered
      // 3 times in quick succession. This is the scenario that triggers the
      // skipWaiting race condition.
      setPhase('Stress test: rapid-fire after unregister...');
      const regs3 = await navigator.serviceWorker.getRegistrations();
      for (const reg of regs3) await reg.unregister();
      // NO wait — call immediately to maximize race condition chance
      const rapidResults = await Promise.all([
        ensureServiceWorkerRegistered(),
        ensureServiceWorkerRegistered(),
        ensureServiceWorkerRegistered(),
      ]);
      const allRapidPassed = rapidResults.every((r) => !!r?.active);
      steps.push({
        name: 'Stress test: 3x rapid-fire after unregister',
        passed: allRapidPassed,
        detail: rapidResults
          .map(
            (r, i) =>
              `Call ${i + 1}: ${r?.active ? 'active=' + r.active.state : 'FAILED (null)'}`
          )
          .join(' | '),
      });
    } catch (e: unknown) {
      steps.push({
        name: 'UNEXPECTED ERROR',
        passed: false,
        detail: e instanceof Error ? e.message : String(e),
      });
    }

    const overallPass = steps
      .filter((s) => s.name !== 'Race condition check: registration.active immediately')
      .every((s) => s.passed);

    const testResults: TestResults = {
      steps,
      overallPass,
      timestamp: new Date().toISOString(),
    };

    setResults(testResults);
    setRunning(false);
    setPhase('done');
  }, []);

  // Auto-run test on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      runTest();
    }, 500);
    return () => clearTimeout(timer);
  }, [runTest]);

  return (
    <div className="container mx-auto p-6 max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Service Worker E2E Test</h1>
          <p className="text-sm text-muted-foreground">
            Verifies the service worker registration race condition fix
          </p>
        </div>
        <button
          onClick={runTest}
          disabled={running}
          className="px-4 py-2 rounded-md bg-primary text-primary-foreground disabled:opacity-50"
        >
          {running ? 'Running...' : 'Re-run Test'}
        </button>
      </div>

      {running && (
        <div className="p-4 rounded-md border bg-muted/50">
          <p className="text-sm font-mono" id="sw-test-phase">
            ⏳ {phase}
          </p>
        </div>
      )}

      {results && (
        <>
          {/* Overall result banner */}
          <div
            id="sw-test-overall"
            data-pass={results.overallPass}
            className={`p-4 rounded-md border-2 text-center text-lg font-bold ${
              results.overallPass
                ? 'border-green-500 bg-green-500/10 text-green-700 dark:text-green-400'
                : 'border-red-500 bg-red-500/10 text-red-700 dark:text-red-400'
            }`}
          >
            {results.overallPass ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}
          </div>

          {/* Individual test steps */}
          <div className="space-y-2">
            {results.steps.map((step, i) => (
              <div
                key={i}
                id={`sw-test-step-${i}`}
                data-passed={step.passed}
                className={`p-3 rounded-md border ${
                  step.passed
                    ? 'border-green-500/30 bg-green-500/5'
                    : 'border-red-500/30 bg-red-500/5'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>{step.passed ? '✅' : '❌'}</span>
                  <span className="font-medium text-sm">{step.name}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1 ml-6">
                  {step.detail}
                </p>
              </div>
            ))}
          </div>

          <div className="text-xs text-muted-foreground">
            Test completed at: {results.timestamp}
          </div>
        </>
      )}
    </div>
  );
}
