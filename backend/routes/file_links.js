require("dotenv").config();
const AWS = require("aws-sdk");
const express = require("express");
const passport = require("passport");
const UserModel = require("../database");
require('../passport')

const bucket_name = "freeride-ridereports-dev";
const bucketParams = { Bucket: bucket_name };
AWS.config.update({
  accessKeyId: process.env.KeyId,
  accessSecretKey: process.env.SecretKey,
  region: process.env.region,
});
const s3 = new AWS.S3();

const router = express.Router();


// get request to fetch the links from the biggest date
router.get("/", (req, res) => {
  try {
    s3.listObjects(bucketParams, function (err, data) {
      if (err) {
        console.log("Error", err);
      } else {
        var objects = data.Contents;
        var links = [];
        var temp = objects[0].Key.split("/");
        var date = [temp[0], temp[1]];
        for (let i = 1; i < objects.length; i++) {
          if (temp[0] < date[0]) {
            date = [temp[0], temp[1]];
          } else if (temp[0] == date[0] && temp[1] > date[1]) {
            date[1] = temp[1];
          }
        }

        for (let i = 0; i < objects.length; i++) {
          var temp = objects[i].Key.split("/");
          if (temp[0] == date[0] && temp[1] == date[1]) {
            const url = s3.getSignedUrl("getObject", {
              Bucket: "freeride-ridereports-dev",
              Key: objects[i].Key,
              Expires: 3600,
            });
            links[links.length] = {};
            links[links.length - 1]["id"] = links.length;
            links[links.length - 1]["date"] = [temp[0], temp[1]];
            links[links.length - 1]["url"] = url;
          }
        }

        res.status(200).json({ links: links });
      }
    });
  } catch {
    res.status(400).json({ error: "error.message" });
  }
});


// post request to chose a date
router.post("/", (req, res) => {
  const date = [req.body.year, req.body.month]
  try {
    s3.listObjects(bucketParams, function (err, data) {
      if (err) {
        console.log("Error", err);
      } else {
        var objects = data.Contents;
        var links = [];
        var temp = objects[0].Key.split("/");
        for (let i = 0; i < objects.length; i++) {
          var temp = objects[i].Key.split("/");
          if (temp[0] == date[0] && temp[1] == date[1]) {
            const url = s3.getSignedUrl("getObject", {
              Bucket: "freeride-ridereports-dev",
              Key: objects[i].Key,
              Expires: 3600,
            });
            links[links.length] = {};
            links[links.length - 1]["id"] = links.length;
            links[links.length - 1]["date"] = [temp[0], temp[1]];
            links[links.length - 1]["url"] = url;
          }
        }
        res.status(200).json({ links: links });
      }
    });
  } catch {
    res.status(400).json({ error: "error.message" });
  }
});

//post request to the login
router.post("/login", passport.authenticate('local', {successRedirect: '/', failureRedirect: '/'}));


module.exports = router;
