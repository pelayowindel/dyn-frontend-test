# Preparation

First install React Developer Tools for you browser and on settings pls check "Highlight updates when components render"
![1770880941674](images/GOAL/1770880941674.png)
![1770880901635](images/GOAL/1770880901635.png)

# Current state of the program

### Overview

* this was created with react and tailwind
* right now the application has timer page and recordings page
  ![1770881085016](images/GOAL/1770881085016.png)
  ![1770881126806](images/GOAL/1770881126806.png)
* to much re render issue.

### Timer page

* the whole timer page re-renders when at least one timer start to tick down.
* the whole components re-render when you inputs something on the input and text area.
  ![1770881599416](images/GOAL/1770881599416.png)
* when the timers were 0 it stills re-renders ![1770881766531](images/GOAL/1770881766531.png)

### Recordings page

* there is a table that lists the recordings and where you can play the audio.
* when you search something the current program generates random call recording.
* the whole page re-renders also when you input characters on the input
  ![1770882112405](images/GOAL/1770882112405.png)
* also the page re-renders when you play voice recordings
  ![1770882077813](images/GOAL/1770882077813.png)

# What needs to be updated

### Non page-specific goals

* [ ] add a sidebar for the navigation between to pages.

### Timer page goals

* [ ] fix the re-render on the timer page.
* [ ] make the timers not synced to a single tick.
* [ ] move the create timer card to a modal/dialog box

### Recordings page goals

* [ ] fix the re-renders
* [ ] implement Redux
* [ ] add pagination
* [ ] when you search recordings, it generates random recordings which should not. At the first load of the page you must generate atleast 100 recording records. and use this records for your pagination and search to work

