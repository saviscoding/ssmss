import Amplify from "./node_modules/aws-amplify"
import awsconfig from "./aws-exports"

Amplify.configure(awsconfig)

document
	.getElementById("uploadForm")
	.addEventListener("submit", function (event) {
		event.preventDefault() // Prevent form submission

		// Get the selected MP3 file
		var fileInput = document.getElementById("mp3FileInput")
		var file = fileInput.files[0]

		// Upload the file to S3 using Amplify
		Amplify.Storage.put(file.name, file, { level: "public" })
			.then((result) => {
				console.log("File uploaded successfully:", result)
				// Handle success or update UI as needed
			})
			.catch((error) => {
				console.error("Error uploading file:", error)
				// Handle error or display error message
			})
	})
