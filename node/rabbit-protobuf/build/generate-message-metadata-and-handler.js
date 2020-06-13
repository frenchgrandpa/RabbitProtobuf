/* eslint-disable */
const fs = require("fs");

const outDir = process.argv[2];

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

generateMessageMetadata();

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
