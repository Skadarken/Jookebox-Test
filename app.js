import dotenv from "dotenv";
import path, { resolve } from "path";
import axios from "axios";
import airtable from "airtable";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { platform } from "os";
import { syncBuiltinESMExports } from "module";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configs
dotenv.config({
  path: path.resolve(__dirname, `./env/${process.env.ENVIRONMENT}.env`),
});

var airConfig = airtable;

airConfig.configure({
  endpointUrl: process.env.AIRTABLE_ENDPOINT_URL,
  apiKey: process.env.AIRTABLE_API_KEY,
});

const base = airConfig.base(process.env.BASE_ID);

const customerId = "harishb159@gmail.com";

const getCustomerPlaylist = async (customerId) => {
  base("Customer")
    .select({
      view: "Grid view",
    })
    .eachPage(
      function page(customerRecords, fetchNextPage) {
        // This function (`page`) will get called for each page of records.

        for (const record of customerRecords) {
          if (customerId === record._rawJson.fields.customerId) {
            const playlist = record._rawJson.fields.playlist;
            base("Playlist").find(playlist[0], (err, playListRecord) => {
              if (err) {
                console.error(err);
                return;
              }
              const songList = playListRecord._rawJson.fields.songs;
              for (const song of songList) {
                base("Songs").find(song, function (err, songRecord) {
                  if (err) {
                    console.error(err);
                    return;
                  }
                  console.log("Retrieved Song", songRecord._rawJson.fields.attachments[0].url);
                });
              }
            });
          }
        }

        // To fetch the next page of records, call `fetchNextPage`.
        // If there are more records, `page` will get called again.
        // If there are no more records, `done` will get called.
        fetchNextPage();
      },
      function done(err) {
        if (err) {
          console.error(err);
          return;
        }
      }
    );
};

const urlList = await getCustomerPlaylist("balub98@balunet.com");
