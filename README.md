# Pluralize

Humans are creatures of habit. We consume terabytes of content, but often are stuck in echo chambers with our views bouncing back into the very feeds we share into. Without direct encounters of faith-based conflict, it’s possible to lead a comfortable, pragmatic life without ever thinking about the tensions and conflicts that surround us. Pluralize recognizes that we can’t enable people to have these conversations if we don't first inspire and motivate them. By revealing our tendency to associate disproportionately with people that believe what we believe, Pluralize can produce the mindset necessary for people to be engaged with Interfaith Dialogue.

Pluralize helps people become aware of religions in their social vicinity and suggest ways to help them learn about faith.

## What is Pluralize? 

Pluralize (plural + eyes) recognizes that we can’t force people to have these conversations. They need to be self-motivated, driven by an understanding of the importance of inter-faith cooperation combined with recognition of our individual shortcomings.

Pluralize helps people become aware of religions in their social vicinity and suggest ways to help them learn about faith.

## How it works
Pluralize is a Chrome extension which uses the existing user’s Facebook login and the Graph API to pull religion data from every friend. D3 is used to present data in a radial graph on our front end of the extension and show the reader their friends’ religious demographics vs their country and the world.

## Technical Description
### Data Collection
The primary data used by the app was page likes on Facebook. We developed methods of figuring out what pages a specific Facebook user has liked through careful analysis of the web page's source. Pages and users were tracked by their Graph ID. 

In a similar fashion, we recovered information on the sources of posts on the user's personal news feed. This information was then used to examine the relative religious leanings of friends.


### Front-end
The primary language used for the front-end was Javascript. The entire application was put together within the Google Chrome Extension system to take advantage of its cross-site request capability. JQuery was used for most of the processing work and d3.js was used to help construct the visualization.

In a standard use case, a user who has logged into their Facebook account simply clicks on the Pularlize chrome extension icon in their browser. This opens a separate page where the app fetches the required data from Facebook and displays the visualization.





