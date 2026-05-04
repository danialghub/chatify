import multer from "multer";
import path from 'path'
import fs from 'fs'

//with cloud
// const storage = multer.diskStorage({})

// const upload = multer({ storage })

// export default upload;

//with localStorage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads/'
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true })
        }
        cb(null, uploadDir)
    },
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + '_' + Math.round(Math.random() * 1E9) + path.extname(file.originalname)
        cb(null, uniqueName)
    }

})

const upload = multer({ storage })

export default upload