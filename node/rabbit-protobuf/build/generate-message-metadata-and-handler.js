/* eslint-disable */
const fs = require("fs");

const inDir = process.argv[2];
const outDir = process.argv[3];

const protoFilesInfo = fs
    .readdirSync(inDir)
    .map(f => ({
        fileName: f,
        content: fs.readFileSync(inDir + "/" + f, "utf-8")
    }));
const generatedFilesInfo = fs
    .readdirSync(outDir)
    .map(f => ({
        fileName: f,
        content: fs.readFileSync(outDir + "/" + f, "utf-8")
    }));


function getNames(content) {
    return content
        .match(/goog\.exportSymbol\('proto\.\S*',/g)
        .map(x => x.split("('proto.")[1].split("',")[0]);
}


function getNamespace(content) {
    return content
        .match(/package \S*;/)[0]
        .split("package ")[1]
        .split(";")[0];
}

generateMessageMetadata();
generateHandler();


function generateMessageMetadata() {
    const jsFileInfos = generatedFilesInfo.filter(x => x.fileName.endsWith("_pb.js") && !x.fileName.endsWith("_grpc_pb.js"));

    for (const fileInfo of jsFileInfos) {
        const names = getNames(fileInfo.content);
        for (const name of names) {
            fileInfo.content = fileInfo.content + `\nproto.${name}.prototype.name = "${name}";`;
        }
    }

    for (const fileInfo of jsFileInfos) {
        fs.writeFileSync(outDir + "/" + fileInfo.fileName, fileInfo.content, "utf-8")
    }
}


function generateHandler() {
    const tsFileInfos = generatedFilesInfo.filter(x => x.fileName.endsWith("_pb.d.ts"));

    const importStatements = [];
    const methods = [];
    const eventToMethodMap = {};
    for (let i = 0; i < tsFileInfos.length; i++) {
        const tsFile = tsFileInfos[i];
        const jsFile = generatedFilesInfo.find(x => x.fileName === tsFile.fileName.replace("d.ts", "js"));
        const protoFile = protoFilesInfo.find(x => x.fileName === tsFile.fileName.replace("_pb.d.ts", ".proto"));

        if (!jsFile || !protoFile) {
            throw new Error("Failed to find corresponding js or proto file for " + tsFile.fileName);
        }

        importStatements.push(`import * as protos${i} from "./${tsFile.fileName.replace(".d.ts", "")}";`);

        const namespace = getNamespace(protoFile.content)
        const handlersInfo = getNames(jsFile.content)
            .map(n => {
                const temp = n.replace(namespace + ".", "");
                const methodName = `on${temp.replace(/\./g, "")}Async`;
                return {
                    eventName: n,
                    methodName: methodName,
                    method: `${methodName}(message: Binary<protos${i}.${temp}>): Promise<void>;`
                };
            });

        methods.push(...(handlersInfo.map(x => x.method)));

        for (const handlerInfo of handlersInfo) {
            eventToMethodMap[handlerInfo.eventName] = handlerInfo.methodName;
        }
    }

    const template = `${importStatements.join("\n")}
import {EventHandlerBase} from "rabbit-protobuf";

export type Binary<T> = Buffer;

export interface EventHandler extends EventHandlerBase { 
    ${methods.join("\n    ")}
}`;
    fs.writeFileSync(outDir + "/EventHandler.d.ts", template, "utf-8");


    fs.writeFileSync(outDir + "/EventMap.json", JSON.stringify(eventToMethodMap), "utf-8");
}
