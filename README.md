# Boozang Docker container

[`degardinn/boozang`](https://hub.docker.com/r/ndegardin/boozang/)

A [Boozang](https://boozang.com/) container, based on [alekzonder/puppeteer](https://hub.docker.com/r/alekzonder/puppeteer/), to run Boozang tests in a headless browser.

## Description

This container executes a *Boozang* test (or test suite) defined by the provided *Boozang* test URL, in an headless [Chromium](https://www.chromium.org/) browser (via [Puppeteer](https://developers.google.com/web/tools/puppeteer/)).

It returns an error code if the test fails, and its report can be accessed thanks to a docker volume.

This container is mainly designed to be integrated to a *Continuous Integration* workflow.

### Requirement

To work properly, the command line should target an environment embedding a ***Boozang* cross-browser code fragment** as defined in the *Boozang* documentation. Otherwise, the script execution might simply hang.

Basically, the server at the targeted domain and port should serve such an HTML file (where **id** is set to a proper *Boozang project id*):

```
<DOCTYPE html>
<script type='text/javascript' src='//ai.boozang.com/ide?id=6d34d123abfe65dc'></script>
```

The *Boozang* test URL must call the code fragment, and can end with **/run** (if not the case, **/run** will be appended), for instance:

`http://localhost/bz.html#6d34d123abfe65dc/0.0.1/m1/t1/run`

## Usage

### Basic

The base command takes the **test URL** as a mandatory parameter:

`docker run --rm --shm-size 1G degardinn/boozang https://localhost/bz.html#6d34d123abfe65dc/0.0.1/m3/t2`

* `--rm` can be specified to remove the container after the test execution.
* `--shm-size 1G` should be specified to increase the memory available for the virtual browser

The command outputs the test steps and result to the console, and returns the following exit codes:

* 0 if the tests succeeded
* 1 if the tests failed
* 2 in case of any other error

### Environment variables

The following optional environment variables can be specified.

* `DEVICE`: define a specific [device](https://github.com/GoogleChrome/puppeteer/blob/master/DeviceDescriptors.js) to run the tests
* `TIMEOUT`: define the command timeout time in seconds
* `TOKEN`: add a *Boozang* user token to the URL, to allow user connection. The token can also be directly specified in the URL. In this case, the environment variable token will be ignored.
* `FILE`: define the report and screenshot file name (without an extension). If not specified, the name is `boozang` followed by the date and time
* `SCREENSHOT`: if *true*, a screenshot is taken two seconds after opening the URL.

Example:

`docker run -e TIMEOUT=60 -e TOKEN=a4fd68b4b239 -e FILE=my-custom-name degardinn/boozang https://localhost/bz.html#6d34d123abfe65dc/0.0.1/m3/t2`


### Accessing reports

The report and screenshot are written to the container `/var/boozang` volume.

To retrieve them, the volume can be mapped to a local directory, this way:

`docker run -e SCREENSHOT=1 -v "$(pwd):/var/boozang" degardinn/boozang https://localhost/bz.html#6d34d123abfe65dc/0.0.1/m3/t2`