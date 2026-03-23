const express = require("express");
const { createPet, getUserPets, getAllPets, deletePet, searchPets, updatePet, requestPassport, getPassportRequests, evaluatePassport } = require("../controllers/pets");

const router = express.Router();

router.post("/", createPet);
router.put("/:id", updatePet);
router.get("/search", searchPets);
router.get("/user/:userId", getUserPets);
router.get("/", getAllPets);
router.delete("/:id", deletePet);

// Passport routes
router.get("/passport-requests", getPassportRequests);
router.put("/:id/request-passport", requestPassport);
router.put("/:id/evaluate-passport", evaluatePassport);

module.exports = router;
