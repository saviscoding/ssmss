//Initialize AWS SDK
AWS.config.update({
	region: "eu-west-2",
	credentials: new AWS.Credentials(
		"AKIAYZIC2YAWQJF2T7UA",
		"FUYBILi/MHB+eu2/55TF5+shnDtb4pPIp6HpcWf0"
	)
})

import { Amplify } from "aws-amplify"
import awsConfig from "./aws-exports"

Amplify.configure(awsConfig)

// Function to fetch URLs from DynamoDB and display them on the webpage
function fetchAndDisplayURLs() {
	const docClient = new AWS.DynamoDB.DocumentClient()

	const params = {
		TableName: "music_library" // Replace with your table name
	}

	docClient.scan(params, function (err, data) {
		if (err) {
			console.error("Error retrieving data from DynamoDB:", err)
		} else {
			const items = data.Items // Array of items retrieved from DynamoDB
			// Process the retrieved items and extract the URLs and artist names
			const urls = items.map((item) => item.url)
			const artistNames = items.map((item) => item.artist)
			const trackTitles = items.map((item) => item.song)

			// Call a function to dynamically display the URLs and artist names on your webpage
			displayURLs(urls, artistNames, trackTitles)
		}
	})
}

// Function to dynamically display URLs and artist names on the webpage
function displayURLs(urls, artistNames, trackTitles) {
	const container = document.getElementById("audio-container")

	for (let i = 0; i < urls.length; i++) {
		const url = urls[i]
		const artistName = artistNames[i]
		const trackTitle = trackTitles[i]

		const audio = document.createElement("audio")
		const source = document.createElement("source")
		audio.controls = true
		audio.className = "rounded-lg shadow-lg mb-2 p-2 bg-white"
		source.src = url
		source.type = "audio/mp3"
		audio.appendChild(source)

		const artistTrackElement = document.createElement("p")
		artistTrackElement.textContent =
			(artistName || "Unknown Artist") + " - " + (trackTitle || "Unknown Track")
		artistTrackElement.className = "text-lg mt-2"

		container.appendChild(artistTrackElement)
		container.appendChild(audio)
	}
}

// Function to upload a file to S3 and add metadata to DynamoDB
function uploadFile(event) {
	event.preventDefault()

	const fileInput = document.getElementById("file-upload")
	const artistNameInput = document.getElementById("artist-name")
	const trackTitleInput = document.getElementById("track-title")

	const file = fileInput.files[0]
	const artistName = artistNameInput.value
	const trackTitle = trackTitleInput.value

	if (!file || !artistName || !trackTitle) {
		alert("Please fill in all the required fields.")
		return
	}

	const s3 = new AWS.S3()
	const s3BucketName = "music-bucket114630-dev"
	const dynamoDBTableName = "music_library"

	const s3Params = {
		Bucket: s3BucketName,
		Key: file.name,
		Body: file
	}

	// Upload the file to S3
	s3.upload(s3Params, function (err, data) {
		if (err) {
			console.error("Error uploading file to S3:", err)
			return
		}

		const trackURL = data.Location

		const dynamoDB = new AWS.DynamoDB.DocumentClient()

		const dynamoDBParams = {
			TableName: dynamoDBTableName,
			Item: {
				artist: artistName,
				song: trackTitle,
				url: trackURL
			}
		}

		// Add metadata to DynamoDB
		dynamoDB.put(dynamoDBParams, function (err) {
			if (err) {
				console.error("Error adding metadata to DynamoDB:", err)
			} else {
				console.log("File uploaded and metadata added successfully.")
				// Refresh the displayed URLs after successful upload
				fetchAndDisplayURLs()
			}
		})
	})
}

// Call the function to fetch and display URLs when the page loads
window.addEventListener("load", function () {
	fetchAndDisplayURLs()

	const uploadForm = document.getElementById("upload-form")
	uploadForm.addEventListener("submit", uploadFile)
})
