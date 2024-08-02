const { createUploadthing } = require('uploadthing/express');

const f = createUploadthing({
    errorFormatter: (err) => {
        return {
            message: err.message,
        };
    },
});

const uploadRouter = f({ image: { maxFileSize: "1MB" } })
    .onUploadComplete(({ metadata, file }) => {
        console.log('Upload complete for userId:', metadata.userId);
        console.log('file url', file.url);
    })


module.exports = { uploadRouter };
