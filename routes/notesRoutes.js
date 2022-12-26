const express = require("express")
const router = express.Router()
const path = require("path")

const notesController = require(path.join(__dirname, '../controllers/notesController'))


router.route('/')
    .get(notesController.getAllNotes)
    .post(notesController.createNewNote)
    .patch(notesController.updateNote)
    .delete(notesController.deleteNote)


module.exports = router