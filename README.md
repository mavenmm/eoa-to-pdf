# PDF Creator from ZIP of Images

This project is a script that takes a ZIP file of images as input, extracts the images, and creates a PDF where each image is a separate page.

## Prerequisites

- Node.js
- zx

## Installation

Install zx globally with the following command:

```
#bash

npm install -g zx
```


## Usage

To run the script, use the following command:

```
#bash

zx script.mjs ./path-to-your-zip-file.zip

```
Replace ./path-to-your-zip-file.zip with the path to your ZIP file.

The script will create a PDF in the same directory where you run the script. The PDF will have the same name as the ZIP file, with the current date appended, and a .pdf extension.