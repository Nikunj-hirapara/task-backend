import productController from "./taskController";

// path: "", method: "post", controller: "",
// validation: ""(can be array of validation), 
// isEncrypt: boolean (default true), isPublic: boolean (default false)

export default [    
    {
        path: "/",
        method: "get",
        controller: productController.getTask,
        isPublic:true
    },
    {
        path: "/",
        method: "post",
        controller: productController.addTask,
        isPublic:true
    },
    {
        path: "/:id",
        method: "put",
        controller: productController.updateTask,
        isPublic:true
    },
    {
        path: "/:id",
        method: "delete",
        controller: productController.deleteTask,
        isPublic:true
    },
];