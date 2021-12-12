import fetch from "node-fetch";

export class URL {
  public display_url: string;
  public expanded_url: string;
  public indices: number[];
  public url: string;
}

export class Photo {
  public expandedUrl: string;
  public url: string;
  public width: number;
  public height: number;
}

export class Entities {
  hashtags: {
    text: string,
  }[];
  urls: URL[];
  media: URL[];
  user_mentions: User[];
}

export class User {
  public id_str: string;
  public name: string;
  public profile_image_url_https: string;
  public screen_name: string;
  public verified: boolean;
}

export class Quoted {
  public reply_count: number;
  public created_at: string;
  public entities: Entities | undefined;
  public id_str: string;
  public text: string;
  public user: User;
}

export class Tweet {
  public in_reply_to_status_id_str: string | undefined;
  public created_at: string;
  public entities: Entities | undefined;
  public id_str: string;
  public text: string;
  public user: User;
  public quoted_tweet: Quoted;
  public photos: Photo[] | undefined
}

const api_prefix = "https://cdn.syndication.twimg.com/tweet?id=";

const singleTweetContent = `
<div class="tweet">
  <a rel="noopener noreferrer" href="https://twitter.com/{$USER_SCREEN_NAME}/">
    <div class="profile_picture_block">
      <img src="{$PROFILE_PIC_SRC}" alt="Profile picture of @{$USER_SCREEN_NAME} on Twitter." />
      @{$USER_SCREEN_NAME}
    </div>
  </a>
  <p class="text">{$TEXT}</p>{$QUOTED}{$IMG}
  <p class="date">
    <a rel="noopener noreferrer" href="https://twitter.com/{$USER_SCREEN_NAME}/status/{$TWEET_ID}">Read more...</a>
  </p>
</div>`;

const quotedContent = `
<div class="quoted_tweet">
  {$TEXT}
  <br/>
  <p>
    - <a rel="noopener noreferrer" href="https://twitter.com/{$USER_SCREEN_NAME}/">@{$USER_SCREEN_NAME}</a>
    <br />
    <a rel="noopener noreferrer" href="https://twitter.com/{$USER_SCREEN_NAME}/status/{$TWEET_ID}">Read more...</a>
  </p>
</div>`;

const imageContent = `<br />
<div class="tweet_img_block">
  <img class="tweet_img" src="{$IMG_URL}" />
</div>
<br />
`

const tweetTextContent = `<p class="text">{$TEXT}</p>{$QUOTED}{$IMG}
  `;

const fullPageThreadContent = `<div class="tweet_block">
  <a rel="noopener noreferrer author" href="https://twitter.com/{$USER_SCREEN_NAME}/">
    <div class="profile_picture_block">
      <img src="{$PROFILE_PIC_SRC}" alt="Profile picture of @{$USER_SCREEN_NAME} on Twitter." />
      @{$USER_SCREEN_NAME}
    </div>
  </a>
  {$CONTENT}<p class="date">
    <a rel="noopener noreferrer alternate" href="https://twitter.com/{$USER_SCREEN_NAME}/status/{$TWEET_ID}">{$TWEET_DATE}</a>
  </p>
</div>`;

const urlContent = `<a style="word-break:break-all;" rel="noopener noreferrer" href="{$URL}" >{$URL}</a>`;
const hashtagUrlContent = `<a rel="noopener noreferrer" href="https://twitter.com/hashtag/{$HASHTAG}" >#{$HASHTAG}</a>`;
const mentionUrlContent = `<a rel="noopener noreferrer" href="https://twitter.com/{$SCREEN_NAME}" >@{$SCREEN_NAME}</a>`;

export async function genTweet(tweet_id: string): Promise<Tweet> {
  const res = await fetch(api_prefix + tweet_id);
  return (await res.json()) as Tweet;
}

export async function genThread(tweet_id: string): Promise<Tweet[]> {
  const json = await genTweet(tweet_id);

  let toRet: Tweet[] = [];

  if (json.in_reply_to_status_id_str !== undefined) {
    toRet = await genThread(json.in_reply_to_status_id_str);
  }

  toRet.push(json);
  return toRet;
}

export async function genThreadHTML(tweet_id: string): Promise<string> {
  let toRet = fullPageThreadContent;
  let body = "";
  const thread = await genThread(tweet_id);

  toRet = toRet.split("{$USER_SCREEN_NAME}").join(thread[0].user.screen_name);
  toRet = toRet.split("{$PROFILE_PIC_SRC}").join(processImageURL(thread[0].user.profile_image_url_https));
  toRet = toRet.split("{$TWEET_ID}").join(thread[0].id_str);
  toRet = toRet.split("{$TWEET_DATE}").join(processDate(thread[0].created_at));

  for (var tweet of thread) {
    let rendered = tweetTextContent;
    rendered = rendered.split("{$TEXT}").join(processText(tweet.text, tweet.entities, tweet.quoted_tweet));
    if (tweet.quoted_tweet !== undefined) {
      const quotedTweet = await genTweetHTML(tweet.quoted_tweet.id_str);
      rendered = rendered.replace("{$QUOTED}", quotedTweet.split("\n").join("\n  "));
    } else {
      rendered = rendered.replace("{$QUOTED}", "");
    }

    if (tweet.photos !== undefined) {
      let imgs = "";
      for (const photo of tweet.photos) {
        imgs += getImage(photo)
      }
      rendered = rendered.replace("{$IMG}", imgs);
    } else {
      rendered = rendered.replace("{$IMG}", "");
    }
    body = body + rendered;
  }

  return toRet.replace("{$CONTENT}", body);
}

export async function genTweetHTML(tweet_id: string): Promise<string> {
  const tweet = await genTweet(tweet_id);
  let toRet = singleTweetContent;
  toRet = toRet.split("{$USER_SCREEN_NAME}").join(tweet.user.screen_name);
  toRet = toRet.split("{$PROFILE_PIC_SRC}").join(processImageURL(tweet.user.profile_image_url_https));
  toRet = toRet.split("{$TWEET_ID}").join(tweet.id_str);
  toRet = toRet.split("{$TWEET_DATE}").join(processDate(tweet.created_at));
  toRet = toRet.split("{$TEXT}").join(processText(tweet.text, tweet.entities, tweet.quoted_tweet));
  if (tweet.quoted_tweet !== undefined) {
    toRet = toRet.replace("{$QUOTED}", quotedHTML(tweet.quoted_tweet));
  } else {
    toRet = toRet.replace("{$QUOTED}", "");
  }

  if (tweet.photos !== undefined) {
    let imgs = "";
    for (const photo of tweet.photos) {
      imgs += getImage(photo)
    }
    toRet = toRet.replace("{$IMG}", imgs);
  } else {
    toRet = toRet.replace("{$IMG}", "");
  }
return toRet;
}

function processImageURL(url: string): string {
  return url.replace("normal", "200x200");
}

function processDate(ISODate: string): string {
  return new Date(ISODate).toLocaleDateString();
}

function processText(text: string, entities: Entities | undefined, quoted: Quoted | undefined): string {
  if (entities !== undefined) {
    if (entities.urls !== undefined) {
      entities.urls.forEach(
        (url) => {
          if (quoted !== undefined && url.expanded_url.startsWith("https://twitter.com/" + quoted.user.screen_name + "/status/" + quoted.id_str)) {
            text = text.split(url.url).join("");
          } else {
            text = text
              .split(url.url)
              .join(urlContent.split("{$URL}").join(url.expanded_url));
          }
        }
      );
    }

    if (entities.media !== undefined) {
      entities.media.forEach(
        (url) => {
          text = text.split(url.url).join("");
        }
      );
    }

    entities.hashtags.forEach(
      (hashtag) => {
        text = text
          .split("#" + hashtag.text)
          .join(
            hashtagUrlContent
              .split("{$HASHTAG}")
              .join(hashtag.text)
          );
      }
    );
    entities.user_mentions.forEach(
      (mention) => {
        text = text
          .split("@" + mention.screen_name)
          .join(
            mentionUrlContent.split("{$SCREEN_NAME}").join(mention.screen_name)
          );
      }
    )
  }
  text = text.trim().split("\n").join("\n  <br />");
  text = text.trim().split("\n  <br />\n  <br />").join("\n  <br />");
  return text;
}

function quotedHTML(quoted: Quoted, tabbed: boolean = true): string {
  let toRet = quotedContent;
  toRet = toRet.split("{$USER_SCREEN_NAME}").join(quoted.user.screen_name);
  toRet = toRet.split("{$TWEET_ID}").join(quoted.id_str);
  toRet = toRet.split("{$TWEET_DATE}").join(processDate(quoted.created_at));
  toRet = toRet.split("{$TEXT}").join(processText(quoted.text, quoted.entities, undefined));
  if (tabbed) {
    toRet = toRet.split("\n").join("\n  ");
  }
  return toRet;
}

function getImage(image: Photo): string {
  let toRet = imageContent;
  toRet = toRet.replace("{$IMG_URL}", image.url)
  return toRet;
}