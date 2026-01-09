/************************************************
 *    Scripted Browser Logger Template          *
 ************************************************/

// The global start time for this script
const GLOBAL_START_TIME = Date.now();
// Step type definitions - DO NOT MODIFY THIS
const STEP_TYPE = { HARD: 3, SOFT: 2, OPTIONAL: 1 };

// --- User modifiable section starts here ---

// Add any required modules or shortcuts for the script and steps
const assert = require("assert");
const By = $selenium.By;
const until = $selenium.until;


// If needed/desired, set a custom width and/or height for the viewport of desktop browsers in pixels (default = 1366 x 768);
const DESKTOP_VIEWPORT_WIDTH=1200 
const DESKTOP_VIEWPORT_HEIGHT=1080

// Implicit timeout - the default for Synthetic Monitors is 10 seconds.
// It can be better to reduce this to 1 or even 0 seconds and use explicit timeouts where they are needed.
const IMPLICIT_TIMEOUT_SECONDS=1;

// If DEBUG is true for a step type, the source code of the stepFn function will be output in the console if a failure occurs.
const DEBUG_STEP_TYPE = {
  HARD: true,
  SOFT: true,
  OPTIONAL: false
}

// Record the step failures as attributes with the synthetic check
const USE_FAILURE_ATTRIBUTES = true;

// Declare any helper functions you wish to use in the steps here


// Define each step of the script using the template
const STEPS = [
/*
  {
    type: STEP_TYPE.HARD, //optional - STEP_TYPE.HARD, STEP_TYPE.SOFT or STEP_TYPE.OPTIONAL. Defaults to STEP_TYPE.HARD.
    description: "", // Provide a description for this step
    category: "", // Each step can be grouped into a category. If no category is provided for a step the previous step's category will be used.
    stepFn: async (obj) => {  // The async function to be invoked for this step.
      // Perform the task for this step, e.g. load the desired page

      // Once the task is finished, perform a check to ensure that it was successful, e.g. page title, current URL, displayed text, etc

      // You can specify an object to be returned (e.g. a found element) and it will then be passed to the next step as 'obj'
      // return <object name>;
      return;
    }
  },
*/
  {
    type: STEP_TYPE.HARD, 
    description: "Open https://www.example.com/", 
    category: "New Relic Synthetics Journey",
    stepFn: async (obj) => {
      // Perform the task for this step, e.g. load the desired page
      await $webDriver.get("https://www.example.com/");
      // Once the task is finished, perform a check to ensure that it was successful, e.g. page title, current URL, displayed text, etc
      assert.equal(await $webDriver.getTitle(), 'Example Domain', 'The domain for the loaded page is not as expected');
      
      // You can specify an object to be returned (e.g. a found element) and it will then be passed to the next step
      const linkElement = await $webDriver.findElement(By.css('p > a'));
      return linkElement;
    }
  },
 {
    //type: STEP_TYPE.SOFT, 
    description: "Click the link on the page", 
    category: "New Relic Synthetics Journey",
    stepFn: async (obj) => {
      // Perform the task for this step, e.g. click on the element found in the previous step
      await obj.click();
      // Once the task is finished, perform a check to ensure that it was successful, e.g. page title, current URL, displayed text, etc
      assert.equal(await $webDriver.getCurrentUrl(), 'https://www.iana.org/help/example-domains', 'We did not receive the expacted page from the click');
      // You can specify an object to be returned (e.g. a found element) and it will then be passed to the next step
      return;
    }
  },

];

// --- User modifiable section ends here ---

async function updateCheckSettings() {

  console.log('=====[ SYNTHETIC CHECK SETTINGS ]======');

  // Set the implicit timeout to the specified number of seconds
  if (typeof IMPLICIT_TIMEOUT_SECONDS === 'number') {
    console.log(`Setting implicit timeout to ${IMPLICIT_TIMEOUT_SECONDS} second${IMPLICIT_TIMEOUT_SECONDS === 1? '': 's'}.`);
    await $webDriver.manage().setTimeouts({ implicit: IMPLICIT_TIMEOUT_SECONDS * 1000 });
  } else {
    console.log('Using the default implicit timeout of 10 seconds.');
  }
  
  const currentDevice = await $webDriver.executeScript("return { userAgent: window.navigator.userAgent.toLowerCase(), width: window.screen.width, height: window.screen.height, portrait: window.screen.height > window.screen.width }");
  const browser = currentDevice.userAgent.indexOf('firefox') > -1 ? 'firefox' : 'chrome';
  let browserMajorVer = '?', browserVerLoc = currentDevice.userAgent.indexOf(browser);
  if (browserVerLoc > -1) {
    browserVerLoc += browser.length + 1;
    browserMajorVer = currentDevice.userAgent.slice(browserVerLoc, currentDevice.userAgent.indexOf('.', browserVerLoc));
  }
  console.log(`Using ${browser.charAt(0).toUpperCase()}${browser.slice(1)} v${browserMajorVer} as the browser.`);
  
  // Is this script running under Mobile emulation (i.e. Mobile or Tablet in portrait or landscape mode)?
  if (currentDevice.userAgent.indexOf('Android') === -1) {
    console.log('Running this check as a desktop browser.');
    const currentViewport = await $webDriver.manage().window().getRect();
    let newWidth = currentViewport.width, newHeight = currentViewport.height, changeViewport = false;
    if (typeof DESKTOP_VIEWPORT_WIDTH === 'number' && DESKTOP_VIEWPORT_WIDTH !== newWidth) {
      newWidth = DESKTOP_VIEWPORT_WIDTH;
      changeViewport = true;
    }
    if (typeof DESKTOP_VIEWPORT_HEIGHT === 'number' && DESKTOP_VIEWPORT_HEIGHT !== newHeight) {
      newHeight = DESKTOP_VIEWPORT_HEIGHT;
      changeViewport = true;
    }
    if (changeViewport) {
      console.log(`Changing the viewport size of the desktop browser to ${newWidth} x ${newHeight}.`);
      await $webDriver.manage().window().setRect({ width: newWidth, height: newHeight });
    } else {
      console.log(`Using the default viewport size of the desktop browser of ${newWidth} x ${newHeight}.`);
    }
  } else {
    const deviceType = (currentDevice.width < 500 || currentDevice.height < 500) ? 'mobile' : 'tablet';
    const orientation = (currentDevice.width < currentDevice.height) ? 'portrait' : 'landscape';
    console.log(`Running this check as a ${deviceType} browser in ${orientation} mode (${currentDevice.width} x ${currentDevice.height}).`);
  }
}

// Main function to process the steps.
async function processSteps(steps) {
  // A counter of steps per category
  const CATEGORY_STEP = {};
  // A record of failed soft steps
  const FAILED_STEPS_SOFT = [];
  const FAILED_STEPS_OPTIONAL = [];
  const NUM_STEPS = steps.length;
  
  // Get the details for the current device
  await updateCheckSettings();

  console.log('===========[ JOURNEY START ]===========');
  let stepNum = 0, previousCategory = "none", previousReturnedObj = null;
  for (const step of steps) {
    // Record the start time for this step
    const startTimestamp = Date.now() - GLOBAL_START_TIME;
    // Increase the step count (this was initialised with a value of 0)
    stepNum += 1;

    const description=step.description || `No description provided for step ${stepNum}`;

    // Get the category for this step, or use the previous category if not provided, and then update the previousCategory.
    const category = previousCategory = step.category || previousCategory;

    // Get the step number for this category, initialising it if this is the first step in the category
    const categoryStepNum = CATEGORY_STEP[category] = CATEGORY_STEP[category] ? CATEGORY_STEP[category] += 1 : 1;
    
    console.log(`START  Step ${stepNum} of ${NUM_STEPS}: [${category}: ${categoryStepNum}]: ${description}  ->  started: ${startTimestamp}ms`);
    try {
      //runs the function for this step
      previousReturnedObj = await step.stepFn(previousReturnedObj); 
    } catch (error) {
      // Clear the previousReturnedObj object as it will not have been set by the last stepFn because it threw an error.
      previousReturnedObj = null;
      // Check if the step that threw the error is a SOFT, OPTIONAL or HARD failure.
      if (step.type === STEP_TYPE.SOFT) {
        console.log(`ERROR! Step ${stepNum} of ${NUM_STEPS}: [${category}: ${categoryStepNum}]: ${description}\n  ╚══> This is a SOFT step error so processing of further steps will continue but the journey will be failed.`);
        if (typeof DEBUG_STEP_TYPE === 'object' && DEBUG_STEP_TYPE.SOFT) {
          console.log(`\nDEBUG - stepFn:\n${step.stepFn.toString()}\n`);
        }
        console.log(`Error message:\n${error.message}\n`);
        FAILED_STEPS_SOFT.push({
          stepNum: stepNum,
          failure: `Step ${stepNum} of ${NUM_STEPS}: [${category}: ${categoryStepNum}]: ${description}`,
          reason: error.message,
        });
      } else if (step.type === STEP_TYPE.OPTIONAL) {
        console.log(`ERROR! Step ${stepNum} of ${NUM_STEPS}: [${category}: ${categoryStepNum}]: ${description}\n  ╚══> This is an OPTIONAL step so this error will not fail the journey.`);
        console.log(`Error message:\n${error.message}\n`);
        FAILED_STEPS_OPTIONAL.push(stepNum);
        if (typeof DEBUG_STEP_TYPE === 'object' && DEBUG_STEP_TYPE.OPTIONAL) {
          console.log(`\nDEBUG - stepFn:\n${step.stepFn.toString()}\n`);
        }
      } else {
        console.log(`ERROR! Step ${stepNum} of ${NUM_STEPS}: [${category}: ${categoryStepNum}]: ${description}\n  ╚══> This is a HARD step error so processing of further steps will cease and the journey will be failed.`);
        if (typeof USE_FAILURE_ATTRIBUTES === 'boolean' && USE_FAILURE_ATTRIBUTES) {
          $util.insights.set('hardFailureStepNum', stepNum);
          $util.insights.set('hardFailureStepDesc', description);
          if (FAILED_STEPS_SOFT.length > 0) {
            $util.insights.set('softFailureStepNums', JSON.stringify(FAILED_STEPS_SOFT.map(step => step.stepNum)));
          }
          if (FAILED_STEPS_OPTIONAL.length > 0) {
            $util.insights.set('softFailureStepNums', JSON.stringify(FAILED_STEPS_OPTIONAL));
          }
        }
        if (typeof DEBUG_STEP_TYPE === 'object' && DEBUG_STEP_TYPE.HARD) {
          console.log(`\nDEBUG - stepFn:\n${step.stepFn.toString()}\n`);
        }
        if (FAILED_STEPS_SOFT.length > 0) {
          console.log(FAILED_STEPS_SOFT.length > 1 ? `There were also ${FAILED_STEPS_SOFT.length} soft step failures` : 'There was also 1 soft step failure');
          outputSoftFailures(FAILED_STEPS_SOFT);
        }
        throw error;
      }
    }

    const endTimestamp = Date.now() - GLOBAL_START_TIME;
    console.log(`FINISH Step ${stepNum} of ${NUM_STEPS}: [${category}: ${categoryStepNum}]: ${description}  ->  ended: ${endTimestamp}ms, elapsed: ${endTimestamp - startTimestamp}ms\n`);
  }
  console.log('============[ JOURNEY END ]============');
  if (FAILED_STEPS_SOFT.length > 0) {
    const plural = FAILED_STEPS_SOFT.length > 1 ? 's' : '';
    console.log(`Journey failed: ${FAILED_STEPS_SOFT.length} soft failure${plural} detected:`);
    if (typeof USE_FAILURE_ATTRIBUTES === 'boolean' && USE_FAILURE_ATTRIBUTES) {
      $util.insights.set('softFailureStepNums', JSON.stringify(FAILED_STEPS_SOFT.map(step => step.stepNum)));
    }
    outputSoftFailures(FAILED_STEPS_SOFT);
    assert.fail(`Journey failed: There ${plural ? 'were' : 'was'} ${FAILED_STEPS_SOFT.length} soft step failure${plural}.`);
  }
}

// Helper function to output the list of soft failures (if any)
function outputSoftFailures(failedSteps) {
  const separator = '-'.repeat(50);
  for (const step of failedSteps) {
    console.log(`${separator}\n${step.failure}\nmessage: ${step.reason}`);
  }
  console.log(`${separator}\n`);
}

// Perform the steps defined in the STEPS array
await processSteps(STEPS);
