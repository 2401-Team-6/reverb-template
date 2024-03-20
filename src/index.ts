import dotenv from "dotenv";
dotenv.config();

import server from "@reverb-app/functions";

// event triggered functions have an event property in their props.
server.createFunction({
  id: "my-first-function",
  event: "my-first-event",
  fn: async (event, step) => {
    // you can define steps with step.run
    step.run("my-first-step", async () => {
      return new Promise((resolve) => {
        setTimeout(() => resolve(undefined), 1000);
      }).then(() => console.log("first step complete"));
    });

    // you can wait a designated amount of time before the next step by using
    // step.delay
    step.delay("my-first-delay", "1h"); // wait 1 hour

    step.run("my-second-step", async () => {
      console.log("we done here");
    });

    return "my-first-event complete";
  },
});

// cron triggered functions have a cron property in their props.
server.createFunction({
  id: "my-first-cron-function",
  cron: "0 * * * *", // runs at the top of the hour
  fn: async (event, step) => {
    console.log("cron event fired");
  },
});

server.serve();
