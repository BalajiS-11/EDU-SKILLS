import { chromium } from 'playwright';

async function capture() {
  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true
  });
  const context = await browser.newContext({
    viewport: { width: 1400, height: 1100 }
  });
  const page = await context.newPage();
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));

  console.log('Navigating to http://localhost:5173...');
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // 1. Dashboard
  console.log('Capturing Dashboard...');
  await page.screenshot({ path: 'screen_dashboard.png' });

  // 2. Recommendations Detail Screen
  console.log('Navigating to Study Path...');
  await page.click('button:has-text("Study Path")');
  await page.waitForTimeout(800);
  await page.screenshot({ path: 'screen_recommendations.png' });

  // 3. Concept Map Screen
  console.log('Navigating to Topic Map...');
  await page.click('button:has-text("Topic Map")');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'screen_concept_map.png' });

  // 4. Memory Decay Progress Screen
  console.log('Navigating to Memory Review...');
  await page.click('button:has-text("Memory Review")');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'screen_progress.png' });

  // 5. Targeted Practice Quiz Screen
  console.log('Navigating to Practice Quiz...');
  await page.click('button:has-text("Practice Quiz")');
  await page.waitForTimeout(800);
  await page.screenshot({ path: 'screen_quiz_initial.png' });

  // 6. Demonstrate Feedback Loop: click "Simulate Correct" and capture updated feedback loop card!
  console.log('Simulating feedback loop attempt...');
  await page.click('button:has-text("Simulate Correct")');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'screen_feedback_loop_demonstrated.png' });

  // 7. Capture Weights Modal
  console.log('Capturing Study Focus Modal...');
  await page.click('button:has-text("Study Focus")');
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'screen_weights_modal.png' });

  console.log('All screenshots captured successfully!');
  await browser.close();
}

capture().catch(err => {
  console.error('Error capturing screenshots:', err);
  process.exit(1);
});
