const path = require("path")
const asyncHandler = require("express-async-handler")
const bcrypt = require("bcrypt")

const Users = require(path.join(__dirname, '../models/User'))
const Notes = require(path.join(__dirname, '../models/Note'))


const getAllNotes = asyncHandler(async (req, res) => {
    const notes = await Notes.find().select().lean()
    if (!notes?.length) {
        return res.status(404).json({
            message: "No notes found"
        })
    }
    return res.status(200).json(notes)
})

const createNewNote = asyncHandler(async (req, res) => {
    const { user, title, text, completed } = req.body
    if (!user ||!title ||!text) {
        return res.status(400).json({
            message: "Invalid request"
        })
    }

    // const duplicate = await Notes.findOne({ title }).lean().exec()
    // if (duplicate) {

    //     return res.status(400).json({message: `Note with the title : ${duplicate.title} already exists`})
    // }

    const note = new Notes({
            user,
            title,
            text,
            completed: typeof completed === 'undefined' ? false : completed,
    })
    await note.save()

    if (note) {
        res.status(201).json({ message: `New note : ${note.title} created` })
    } else {
        res.status(500).json({ message: "Failed to create note" })
    }
})

const updateNote = asyncHandler(async (req, res) => {
    const { id, userId, title, text, completed } = req.body
    if (!id || !userId ||!title || !text || typeof completed === 'undefined') {
        return res.status(400).json({
            message: "Bad request, all fields are required."
        })
    }
    const note = await Notes.findById(id).exec()
    if (!note) {
        return res.status(404).json({ message: "Couldn't find provided note. not found" })
    }
    const duplicate = await Notes.findOne({ title }).exec()
    if (duplicate && duplicate.id!== id) {
        return res.status(409).json({ message: `Duplicate title ${title}` }) 
    }

    note.user = userId
    note.title = title
    note.text = text
    note.completed = completed

    const updatedNote = await note.save()
    

    res.status(200).json({ message: "Note updated successfully", updatedNote: updatedNote })
})

const deleteNote = asyncHandler(async (req, res) => {
    const { id, userId } = req.body
    if (!id || !userId) {
        return res.status(400).json({ message: "Bad request, note id and userId required." })
    }
    
    const user = await Users.findById(userId).exec();
    if (user) {
        if (!user.roles.includes('Admin') && !user.roles.includes('Manager')) {
            return res.status(400).json({ message: "User doesn't have permission to delete notes." });
        }
    }
    
    const note = await Notes.findById(id).exec()
    if (!note) {
        return res.status(404).json({ message: "Note not found, invalid Id" })
    }

    const result = await Notes.findByIdAndDelete(id)
    
    res.status(200).json({ message: "Note deleted successfully", deletedNote: result })
})

module.exports = {
    getAllNotes,
    createNewNote,
    updateNote,
    deleteNote
}