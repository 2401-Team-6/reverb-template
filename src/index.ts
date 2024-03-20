import dotenv from "dotenv";
dotenv.config();

import reverb from "@reverb-app/functions";

// Event triggered functions have an 'event' property in their props
reverb.createFunction({
  id: "my-first-function",
  event: "my-first-event",
  fn: async (event, step) => {
    // You can define steps with step.run
    await step.run("my-first-step", async () => {
      return new Promise((resolve) => {
        setTimeout(() => resolve(undefined), 1000);
      }).then(() => console.log("first step complete"));
    });

    // You can wait a designated amount of time before the next step by using
    // step.delay
    await step.delay("my-first-delay", "1h"); // wait 1 hour

    await step.run("my-second-step", async () => {
      console.log("we done here");
    });

    return "my-first-event complete";
  },
});

// Cron triggered functions have a 'cron' property in their props
reverb.createFunction({
  id: "my-first-cron-function",
  cron: "0 * * * *", // runs at the top of the hour
  fn: async (event, step) => {
    console.log("cron event fired");
  },
});

reverb.serve();
