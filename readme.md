# Uni{verse}

P2P Social network

## Basis

Fork from [friends](https://github.com/moose-team/friends).

## Tech

Use react because we're gonna use it at @powershop and it'd be good to get some more practise. Deploy to github pages or s3. Should make it deploy to the web instead of an installable app like friends. Generate a private/public key pair which is your identity and store it in localStorage. Have some way of emailing your key pair to yourself as a backup. Put up a signalhub at signalhub.dizzle.io that has CORS.

## Start up

* Connect to a signalhub and subscribe to all your friends channels, which is named by their public key fingerprint
* Post to your channel your STUN details
* Your friends connect to you when they recieve your STUN details from the signalhub
* When you connect to a peer, you send them which friends you subscribe to, and the peer sends you every post in the past 24 hours that they have on that friends wall

Improvements welcome.

## UI

* Individual users wall (list of posts)
* Newsfeed (all your friends posts sorted by date)
* Comment on posts
* Add friend by going to a URL (eg - "I'm on dizzle - add me dizzle.io/add/Ben+Nolan/435143a1b5fc")
* Friend requests are displayed in your newsfeed
* Accept friend request
* Use html5 desktop notifications to be super intrusive when a friend posts something

## Team

@bnolan
@kellective
@widdershin

## License

MIT

