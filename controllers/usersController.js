const path = require("path")
const asyncHandler = require("express-async-handler")
const bcrypt = require("bcrypt")

const User = require(path.join(__dirname, '../models/User'))
const Notes = require(path.join(__dirname, '../models/Note'))


const getAllUsers = asyncHandler(async (req, res) => {
    const users = await User.find().select("-password").lean()
    if (!users?.length) {
        return res.status(404).json({
            message: "No users found"
        })
    }
    return res.status(200).json(users)
})

const createNewUser = asyncHandler(async (req, res) => {
    const { username, password, role, active } = req.body
    if (!username || !password || !role || typeof active !== 'undefined' & typeof active !== 'boolean') {

        return res.status(400).json({
            message: "Bad request, All fields required"
        })
    }

    const duplicate = await User.findOne({ username }).lean().exec()
    if (duplicate) {
        return res.status(400).json({message: `User ${duplicate.username} already exists`})
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    active = typeof active === 'boolean'? active : true
    const user = new User({
            username,
            password: hashedPassword,
            role,
            active
    })
    await user.save()

    if (user) {
        res.status(201).json({ message: `New user ${user.username} created` })
    } else {
        res.status(500).json({ message: "Failed to create user, invalid user data provided." })
    }
})

const updateUser = asyncHandler(async (req, res) => {
    const { id, username, password, role, active } = req.body
    if (!id ||!username ||!password ||!role || typeof(active) !== "boolean") {
        return res.status(400).json({
            message: "Bad request, All fields required"
        })
    }

    const user = await User.findById(id).exec()
    if (!user) {
        return res.status(404).json({ message: "User not found" })
    }

    const duplicate = await User.findOne({ username }).exec()
    if (duplicate && duplicate.id!== id) {
        return res.status(409).json({ message: `Duplicate username ${username}` }) 
    }

    user.username = username
    user.password = await bcrypt.hash(password, 10)
    user.role = role
    user.active = active

    const updatedUser = await user.save()

    res.status(200).json({ message: "User updated successfully", updatedUser: updatedUser })
})

const deleteUser = asyncHandler(async (req, res) => {
    const { id } = req.body
    if (!id) {
        return res.status(400).json({ message: "Bad request, user id required." })
    }

    const user = await User.findById(id).exec()
    if (!user) {
        return res.status(404).json({ message: "User not found" })
    }

    const notes = await Notes.findOne({ user: id })
    if (notes) {
        return res.status(400).json({ message: `User ${user.username} has assigned Notes, Can't delete user with assigned Notes.` })
    }

    const result = await User.findByIdAndDelete(id)
    delete result.password
    
    res.status(200).json({ message: "User deleted successfully", deletedUser: result })
})

module.exports = {
    getAllUsers,
    createNewUser,
    updateUser,
    deleteUser
}
