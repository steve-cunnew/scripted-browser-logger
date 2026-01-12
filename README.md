# New Relic Scripted Browser Logger
This scripted browser logger template allows you to author the multiple steps of a journey and will then record the timings for each step automatically. It also allows for simpler management of the effect that failures have, where each step can be set to fail the script immediately or defer failure until the script completes, allowing scripted browser journeys to continue even if failures are detected, ensureing as much of your journey is tested as possible before failures are reported. Logging of the device and browser configuration, along with the description, category and timing of each step and optional debug information makes troubleshooting failed checks much easier.

Steps can be:

- ```HARD``` steps that stop the script when they fail. If one of these steps fails the journey ceases.
- ```SOFT``` steps that will fail the journey but the failure is deferred to allow other steps to complete. Failed soft steps will be listed when the script ends. 
- ```OPTIONAL``` steps which are allowed to fail without failing the script. They can be used for optional steps such as hiding adverts or cookie banners.


## Using the template
### Configuration
#### Desktop browser viewport size

- ```DESKTOP_VIEWPORT_WIDTH```
- ```DESKTOP_VIEWPORT_HEIGHT```

#### Implicit timeouts
The Synthetic Checks to default the implicit timeout to 10 seconds. If actions such as finding an element succeed within the 10 seconds they return immediately, but where they fail they will wait for the full 10 seconds. Specifying an explicit timeout that is lower than the implicit timeout (e.g. ```$webDriver.findElement(By.css('#invalidId'), 3000)```) will still wait for the 10 seconds of the implicit timeout. Specifying explicit timeouts greater than the implicit timeout can lead to a timeout equal to multiple implicit timeouts, e.g. specifying to wait 15 seconds could lead to a wait of 20 seconds (see the Selenium documentation [here](https://www.selenium.dev/documentation/webdriver/waits/#:~:text=Warning%3A%20Do%20not%20mix,after%2020%20seconds.). Set the implicit timeout to a value of either 0 or 1 seconds, and then set explicit timeouts in the specific actions where more time is needed.
- ```IMPLICIT_TIMEOUT_SECONDS```

#### Define which step types will output debug code when they fail

```
const DEBUG_STEP_TYPE = {
  HARD: true,
  SOFT: true,
  OPTIONAL: false
}
```

#### Add custom attributes to the SyntheticCheck record for failed steps
- ```USE_FAILURE_ATTRIBUTES```

### Creating the steps to be used in the check
Each step is created as an object in the ```STEPS``` array. There are four properties for each step:
- ```type:``` 
- ```description:```
- ```category:```
- ```stepFn:```

#### Step type
The ```type``` of the step, which can be set to ```STEP_TYPE.HARD```, ```STEP_TYPE.SOFT``` or ```STEP_TYPE.OPTIONAL``` and defines if a failure on that step will cause the script to stop processing any more steps and record the check as a failure (a hard step), allow the script to continue processing and process the next step but will still record the check as a failure (a soft step), or if the failure can be ignored and the next step processed as though nothing had happened (an optional step). If no ```type``` is defined for a step it will default to being a ```HARD``` step.

#### Step description
Each step should have ```description``` which is a string value provided that describes the action performed in the step. This is optional, but will be much more helpful in determining where the script has failed should a failure occur, or in understanding where time is being spent when the duration of a check increases.

#### Step category
The ```category``` can be used to group steps together, such as the area of a website that the actions are being performed against, e.g. 'Browser products', 'View cart', 'Checkout' etc. It is optional, but when a category is specified for a step the following steps will continue to use that category until another category is specified.

#### Step Function
The ```stepFn``` value is the asynchronous function that performs the actions for the step. The function can return a value (e.g. a string, a number, an element, etc) that will be passed to the function of the next step as a parameter, so the function should declare a parameter to receive that value (```obj``` is used in the template function).

Each step should ideally check that the main action it performs has succeeded, such as checking that the desired page has actually loaded. A script that just loads a page and then tries to find an element which it then clicks on could produce an error about the element not being found, but is the element not found because an error page was displayed instead of the requested page or because the element is not being displayed in the desired page?

```
  {
    description: "Open https://www.example.com/", 
    category: "New Relic Synthetics Journey",
    stepFn: async (obj) => {
      // Load the desired page
      await $webDriver.get("https://www.example.com/");

      // After the page has loaded check that the title is that of the page we expected, and fail if it isn't.
      assert.equal(await $webDriver.getTitle(), 'Example Domain', 'The domain for the loaded page is not as expected');

      // Find the link element on the page and return it as an object that will be passed to the next step
      const linkElement = await $webDriver.findElement(By.css('p > a'));
      return linkElement;
    }
  },
  {
    description: "Click the link on the page", 
    stepFn: async (obj) => {
      // Click on the link found in the previous step, which will have been passed to this function as the obj parameter
      await obj.click();

      // After the click on the link a new page will be loaded. Check that the expected page has been loaded, and fail if not.
      assert.equal(await $webDriver.getCurrentUrl(), 'https://www.iana.org/help/example-domains', 'We did not receive the expacted page from the click');
    }
  },
```
