"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const app = express_1.default();
app.get("/", (req, res) => {
    res.send("The sedulous hyena ate the antelope!");
});
app.listen("3000", () => {
    console.log("server is listening on port 3000");
});
//# sourceMappingURL=app.js.map