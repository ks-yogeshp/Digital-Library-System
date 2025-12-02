import fs from 'fs';
import path from 'path';
import { diskStorage } from 'multer';

export const imageConfig = {
  storage: diskStorage({
    destination: (req, file, cb) => {
      const type = req.params.type;
      let folder = './uploads';

      if (type === 'author') {
        folder = './uploads/authors';
      } else if (type === 'book') {
        folder = './uploads/books';
      }
      const fullPath = path.resolve(folder);

      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true }); // creates folders automatically
      }
      cb(null, folder);
    },
    filename: (req, file, cb) => {
      const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const originalName = file.originalname.replace(/\s+/g, '-');
      cb(null, unique + '-' + originalName);
    },
  }),
};
