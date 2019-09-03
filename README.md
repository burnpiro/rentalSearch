# rentalSearch

RentalSearch is chrome extension which allows users to watch properties for rent. Its uses gumtree.pl and olx.pl data and notify user when new property (based on his preferences) appears. 

You can add check this on google web store [https://chrome.google.com/webstore/detail/rentalwatch-wyszukiwarka/cjaiampoeklkdecjifpekmpjdmpailig](https://chrome.google.com/webstore/detail/rentalwatch-wyszukiwarka/cjaiampoeklkdecjifpekmpjdmpailig)

## How to install?

#### Requirements
- npm

#### And follow instructions

inside `./` folder run:

install npm packages

and create dist with extension package

```
npm run build-dev
```
  
If you want to add this to your chrome just go to **"Extension manager"** and click on **"Load unpacked extension"** (This option is only available when "developr mode" checkbox is checked).


#### Build for production

To build extension as zip package just run

```
npm run build
```

It will create `bundle.zip` file with everything in it. That file has to be uploaded into google extension store.