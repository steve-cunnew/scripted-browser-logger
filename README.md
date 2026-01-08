# New Relic Scripted Browser Logger
This scripted browser logger template allows you to author the multiple steps of a journey and will then record the timings for each step automatically. It also allows for simpler management of the effect that failures have on each step.  Each set of the steps can be grouped into categories. Steps can be set to fail the script immediately or defer failure until the script completes, allowing scripted browser journeys to continue even if failures are detected, ensureing as much of your journey is tested as possible before failures are reported. Logging of the device and browser configuration, along with optional debug information makes troubleshooting failed checks much easier.

Steps can be:

- ```HARD``` steps that stop the script when they fail. If one of these steps fails the journey ceases.
- ```SOFT``` steps that will fail the journey but the failure is deferred to allow other steps to complete. Failed soft steps will be listed when the script ends. 
- ```OPTIONAL``` steps which are allowed to fail without failing the script. They can be used for optional steps such as hiding adverts or cookie banners.


## Using the template
Lorem ipsum
