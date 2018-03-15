![alt text](https://raw.githubusercontent.com/wlong0827/pluralize/master/pluralize/logoPluralize.png)

# Pluralize

Humans are creatures of habit. We consume terabytes of content, but often are stuck in echo chambers with our views bouncing back into the very feeds we share into. Without direct encounters of faith-based conflict, it’s possible to lead a comfortable, pragmatic life without ever thinking about the tensions and conflicts that surround us. Pluralize recognizes that we can’t enable people to have these conversations if we don't first inspire and motivate them. By revealing our tendency to associate disproportionately with people that believe what we believe, Pluralize can produce the mindset necessary for people to be engaged with Interfaith Dialogue.

Pluralize helps people become aware of religions in their social vicinity and suggest ways to help them learn about faith.

## What is Pluralize? 

Pluralize (plural + eyes) recognizes that we can’t force people to have these conversations. They need to be self-motivated, driven by an understanding of the importance of inter-faith cooperation combined with recognition of our individual shortcomings.

Pluralize helps people become aware of religions in their social vicinity and suggest ways to help them learn about faith.

## How it works
Pluralize is a Chrome extension which uses the existing user’s Facebook login and the Graph API to pull religion data from every friend. D3 is used to present data in a radial graph on our front end of the extension and show the reader their friends’ religious demographics vs their country and the world.

## Installation Instructions
Since Pluralize is still undergoing review by the Chrome webstore, you'll need to download our code locally to use it for now. Prerequisites: must have the Chrome web browser installed. To do that, follow these simple instructions:

1. Download the Zip file to your computer (should be named something like wlong0827-pluralize-ad1b17f.zip) and unzip it.
2. Open your Chrome browser and access the Extensions page (you can navigate it by going to the url chrome://extensions/)
3. You should see a checkbox called "Developer Mode". Select this option. It should give you now show you additional option buttons.
4. Click on "Load unpacked Extension" and select the folder named "pluralize" inside of your unzipped downloaded folder. IMPORTANT: do not upload the entire unzipped folder; only the interior folder named "pluralize".
![alt text](https://raw.githubusercontent.com/wlong0827/pluralize/master/img/install.png)
5. You should now see in the top right hand corner of your browser the Pluralize chrome extension. Click on it to get started!

## Technical Description
### Data Collection
The primary data used by the app was page likes on Facebook. We developed methods of figuring out what pages a specific Facebook user has liked through careful analysis of the web page's source. Pages and users were tracked by their Graph ID. 

In a similar fashion, we recovered information on the sources of posts on the user's personal news feed. This information was then used to examine the relative religious leanings of friends.

### What does Pluralize do with my Facebook data?
Pluralize never sends your personal information to any external services, and your results stay private unless you choose to share them publicly. Pluralize will need to look up some basic information from your news feed and friends list. In particular, it will examine what your friends have publicly identified their religious affiliation as. All processing is done client-side, so data never leaves your computer.


### Front-end
The primary language used for the front-end was Javascript. The entire application was put together within the Google Chrome Extension system to take advantage of its cross-site request capability. JQuery was used for most of the processing work and d3.js was used to help construct the visualization.

In a standard use case, a user who has logged into their Facebook account simply clicks on the Pularlize chrome extension icon in their browser. This opens a separate page where the app fetches the required data from Facebook and displays the visualization.

## Feedback
We'd love to hear your thoughts on our project as well as any bugs that you may have run across. Feel free to open an issue in Github for technical problems or email me at wlong0827@gmail.com with general feedback.




