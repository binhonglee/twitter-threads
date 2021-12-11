#!/usr/bin/env node
import { exit } from "process";
import { genThreadHTML, genTweetHTML } from "../lib/index";
let args = process.argv.slice(2);

if (args[0] === "--single") {
  args = args.slice(1);
  genSingleTweets(args).then(() => exit(0));
}

if (args[0] === "--threads" || args[0] === "--thread") {
  args = args.slice(1);
}

args.forEach(
  (id) => {
    genThreadHTML(id).then((str) => console.log(str));
  }
)

async function genSingleTweets(args: string[]) {
  for (const id of args) {
    const html = await genTweetHTML(id);
    console.log(html);
  }
}