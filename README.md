# twitter-threads

This package is still in early development and will likely have multiple major changes down the line. The goal is to easily embed not just individual tweets but also an entire Twitter thread into your webpage.

## Library

```ts
import { genThreadHTML, genThread, genTweetHTML, genTweet } from "twitter-threads";

// This refers to a tweet ID.
let id: number;

// Returns HTML of the tweet thread (with the tweet of the given ID as the last tweet in the thread.)
const html = await genThreadHTML(id);

// Returns an array of Tweet object (ordered by the first tweet of the thread to the tweet of the given ID.)
const thread = await genThread(id);

// Returns HTML of the tweet with the given ID.
const html = await genTweetHTML(id);

// Returns a Tweet object of the given ID.
const thread = await genThread(id);
```

## CLI

```sh
> npm i -g twitter-threads
...

> tweets --threads 1441841488464257028
<div class="tweet_block">
  <a rel="noopener" href="https://twitter.com/binhonglee/">
    <div class="profile_picture_block">
      <img src="https://pbs.twimg.com/profile_images/1277520708264816640/rACE3stK_200x200.jpg" />
      @binhonglee
    </div>
  </a>
  <p class="text">Keeping a weekly note at work 
  <br />Earlier this year, I started a routine at work where at the end of the week, I'll make a post with a list of things I've done for the week.
  <br />Thread...</p><p class="text">At first, I did this mostly because I've previously found myself going through multiple weeks of unproductive slumps and figured this is a good way to keep myself accountable and quickly figure out how to get myself back on track.</p><p class="text">I slowly add more stuffs to it overtime (and still do). It used to just be actual work "work" but now I also include procrasti-work (non-urgent stuff you do because you're procrastinating on actual work) or just anything I did that I think is of value.</p><p class="text">Over time, I realized that it helped curb my imposter syndrome as I see that I can consistently complete and deliver stuff week in and week out.
  <br />It also became a lot more obvious when I'm consistently stuck at something and it's time to ask for (more) help.</p><p class="text">I've found it easier to go back to previous issues, discussions, conversations that I had previously.
  <br />Similarly, it's easier to catch patterns where there are consistent issues and we should establish proper process of handling it instead of constantly making one off fixes.</p><p class="text">When I write my personal performance review, I used to have moments where I was feeling like, did I do almost nothing for a whole month? Cause I can't find anything.
  <br />In reality, anything that's not code is less visible thus have little proof of existence.
  <br />/thread</p><p class="date">
    <a rel="noopener" href="https://twitter.com/binhonglee/status/1441841426887634944">9/25/2021</a>
  </p>
</div>

> tweets --single 1441841488464257028
<div class="tweet">
  <a rel="noopener" href="https://twitter.com/binhonglee/">
    <div class="profile_picture_block">
      <img src="https://pbs.twimg.com/profile_images/1277520708264816640/rACE3stK_200x200.jpg" />
      @binhonglee
    </div>
  </a>
  <p class="text">When I write my personal performance review, I used to have moments where I was feeling like, did I do almost nothing for a whole month? Cause I can't find anything.
  <br />In reality, anything that's not code is less visible thus have little proof of existence.
  <br />/thread</p>
  <p class="date">
    <a rel="noopener" href="https://twitter.com/binhonglee/status/1441841488464257028">Read more...</a>
  </p>
</div>
```