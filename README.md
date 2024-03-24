# reverb-template

---

This is the template project for a reverb function server. A reverb function server is a customizable server for defining functions, events, and crons for Reverb.

## Installation

To get started with your own reverb function server you can either download and extract this repo, or use the command:

```
npm create reverb <app-name>
```

This will copy the repo to `./<app-name>` and allow you to start customizing your server. You should then use `npm install` in that directory.

## Usage

### Environmental Variables

For developmental purposes there are two environmental variables that need to be set.

1. `PORT` - the port the server will listen to. We provide a `.env` file that has this set to `3002` to worker with the docker compose file provided.
2. `GRAPHILE_CONNECTION_STRING` - the postgres connection string for the database used for the queue. This is set inside the provided `.env` file to work with the docker compose provided.

### Docker Compose

For development purposes, a `compose.yaml` file has been provided. This will start servers for both mongo and postgres as well as the reverb ingress server( `http://localhost:3001` ) and the reverb worker server. They are preconfigured to work with the environmental variables provided to this server.

To test your server, you may run these commands:

```
docker compose up
npm run dev
```

This will start up the provided dev infrastructure and your server.

### Function Server API

To use the function server API, you need to first import it:

```ts
import reverb from "@reverb-app/functions";
```

You can then define functions with the `createFunction` method. The `createFunction` method takes 1 argument, an `FunctionData` object. There are four properties that can be applied to this object:

1. `id` - This is the unique string identifier for the object
2. `fn` - The function's code
   - Has the type `(event: Event, step: Step) => Promise<any>`
3. `event` - [Optional] If the function is tied to an event, this is the event's name
   - Can not be present with a `cron` property
4. `cron` - [Optional] If the function is tied to a cron, this is the cron string
   - Can not be present with an `event` property
   - Proper format can be found [here](https://worker.graphile.org/docs/cron#crontab-format)

A `FunctionData` must have either an `event` or `cron` property, but not both, for it to be valid.

Inside the `fn` function we provide two parameters. These must always be `await`ed:

1. `event` - The data tied to the event being fired
   - `id` - The unique string ID generated when the event was fired. Is an empty string for a cron.
   - `name` - The name of the event that was fired.
   - `payload` - [Optional] Any data passed with the event when it was fired.
     - `object` type. This will be defined by you and you should check the typing when you run the function.
2. `step` - An object to provide step functionality. It provides these methods:
   1. `run` - `(id: string, callback: () => Promise<any>) => Promise<any>`
      - `id` must be unique
      - `callback` is used to run an individual step.
      - The return value is the return value of the `callback`
   2. `delay` - `(id: string, timePeriod: string) => Promise<any>`
      - `id` must be unique
      - `timePeriod` is the period of time before continuing the function.
        - Can be any combination of number[period] and any number of spaces between
        - period can be `s`(seconds), `m`(minutes), `h`(hours), `d`(days), `w`(weeks), `o`(months)
        - Sample `1d 12h   10m30s` would be 1 day, 12 hours, 10 minutes, and 30 seconds.
   3. `emitEvent` - `(id: string, eventId: string, payload?: object) => Promise<any>`
      - `id` must be unique
      - `eventId` is the event name to be emitted
      - `payload` [Optional] is the payload you wish to pass to the event
   4. `invoke` = `(id: string, invokedFnName: string, payload?: object) => Promise<any>`
      - `id` must be unique
      - `invokedFnName` is the function name to be invoked
      - `payload` [Optional] is the payload you wish to pass to the function via the `event` object

---

Once you have created your functions, you can start your server with the `reverb.serve()` method.

## Deployment

Currently we need a docker image of the function server deployed to an image repository in order to deploy the application. To do this we have provided a `Dockerfile` for you to create your own image.

### Github action

To automate doing so, we have provided a github action in order to automate the dockerization and deployment of the image. To use this action, your github repository must include these secrets:

- `DOCKER_USER` - Your dockerhub account username
- `DOCKER_PASS` - Your dockerhub access token
- `DOCKER_TAG` - The Image tag you want to give the docker image
  - it should be something like `USER/APPNAME`
  - This is what you would pass to the [Reverb Infrastructure CDK](https://github.com/2401-Team-6/reverb-infrastructure)
