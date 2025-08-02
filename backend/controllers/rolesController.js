const User = require("../models/User.js");
const Role = require("../models/Role.js");
const Module = require("../models/Module.js");

const getRoles = async (req, res) => {
    try {
        const roles = await Role.find({
            name: { $ne: "superadmin" } // Exclude superadmin
        });
        res.status(200).json(roles);
    } catch (error) {
        res.status(500).json({ message: "Error fetching roles", error: error.message });
    }
};

const createRole = async (req, res) => {
    const { name } = req.body;
  
    if (!name) {
        return res.status(400).json({ message: 'Role name is required' });
    }
  
    try {
        const role = new Role({ name });
        await role.save();
        res.status(201).json({ message: 'Role saved successfully', role });
    } catch (error) {
        res.status(500).json({ message: 'Error saving role', error: error.message || error });
    }
};

const getRoleById = async (req, res) => {
    const { id } = req.params;
  
    try {
        const role = await Role.findById(id).populate("modules", "id"); // Populate modules and retrieve only their IDs

        if (!role) {
            return res.status(404).json({ message: "Role not found" });
        }

        const moduleIds = role.modules.map(module => module._id);

        res.status(200).json({ role, moduleIds });
    } catch (error) {
        res.status(500).json({ message: "Error retrieving role", error: error.message || error });
    }
};

module.exports = { getRoleById, getRoles, createRole };
