export async function fileToString(file: File): Promise<string> {
    const bytes = await file.bytes()
    let binary = ""
    bytes.forEach(b => binary += String.fromCharCode(b))
    const base64 = btoa(binary);

    return JSON.stringify({
        name: file.name,
        type: file.type,
        data: base64
    });
}

export async function stringToFile(fileString: string): Promise<File> {
    const object = JSON.parse(fileString)
    const file: File = new File(
        [Uint8Array.from(atob(object.data), c => c.charCodeAt(0))],
        object.name,
        { type: object.type }
    )
    return file
}