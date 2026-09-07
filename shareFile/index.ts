import { IInputs, IOutputs } from "./generated/ManifestTypes";

export class ShareFile implements ComponentFramework.StandardControl<IInputs, IOutputs> {
    private _container: HTMLDivElement;
    private _context: ComponentFramework.Context<IInputs>;
    private _cardElement: HTMLDivElement;
    private _fileIcon: HTMLDivElement;
    private _fileTitle: HTMLDivElement;
    private _actionBtn: HTMLButtonElement;

    private _fileRaw: string | null = null;
    private _fileName = "document.pdf";
    private _mimeType = "application/pdf";

    public init(
        context: ComponentFramework.Context<IInputs>,
        notifyOutputChanged: () => void,
        state: ComponentFramework.Dictionary,
        container: HTMLDivElement
    ): void {
        this._context = context;
        this._container = container;

        this._container.style.width = "100%";
        this._container.style.height = "100%";
        this._container.style.display = "flex";
        this._container.style.alignItems = "center";
        this._container.style.justifyContent = "center";
        this._container.style.padding = "10px";
        this._container.style.boxSizing = "border-box";

        this._cardElement = document.createElement("div");
        this._cardElement.style.width = "100%";
        this._cardElement.style.maxWidth = "320px";
        this._cardElement.style.backgroundColor = "#f3f3f3";
        this._cardElement.style.border = "1px solid #e0e0e0";
        this._cardElement.style.borderRadius = "12px";
        this._cardElement.style.padding = "20px";
        this._cardElement.style.display = "flex";
        this._cardElement.style.flexDirection = "column";
        this._cardElement.style.alignItems = "center";
        this._cardElement.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)";

        this._fileIcon = document.createElement("div");
        this._fileIcon.textContent = "📄";
        this._fileIcon.style.fontSize = "48px";
        this._fileIcon.style.marginBottom = "10px";

        this._fileTitle = document.createElement("div");
        this._fileTitle.textContent = this._fileName;
        this._fileTitle.style.fontSize = "14px";
        this._fileTitle.style.fontWeight = "600";
        this._fileTitle.style.color = "#333";
        this._fileTitle.style.textAlign = "center";
        this._fileTitle.style.wordBreak = "break-all";
        this._fileTitle.style.marginBottom = "16px";

        this._actionBtn = document.createElement("button");
        this._actionBtn.textContent = "Завантажити / Поширити";
        this._actionBtn.style.backgroundColor = "#0078d4";
        this._actionBtn.style.color = "#ffffff";
        this._actionBtn.style.border = "none";
        this._actionBtn.style.padding = "10px 20px";
        this._actionBtn.style.borderRadius = "20px";
        this._actionBtn.style.fontSize = "14px";
        this._actionBtn.style.fontWeight = "600";
        this._actionBtn.style.cursor = "pointer";

        this._actionBtn.addEventListener("click", () => {
            this._handleFileAction();
        });

        this._cardElement.appendChild(this._fileIcon);
        this._cardElement.appendChild(this._fileTitle);
        this._cardElement.appendChild(this._actionBtn);

        this._container.appendChild(this._cardElement);
    }

    public updateView(context: ComponentFramework.Context<IInputs>): void {
        this._context = context;

        const raw = context.parameters.fileRaw.raw;
        const name = context.parameters.fileName.raw;
        const mime = context.parameters.mimeType.raw;

        if (raw) this._fileRaw = raw;
        if (name) {
            this._fileName = name;
            this._fileTitle.textContent = name;
        }
        if (mime) this._mimeType = mime;
    }

    private _handleFileAction(): void {
        if (!this._fileRaw) {
            alert("Файл ще не завантажено.");
            return;
        }

        try {
            let cleanBase64 = this._fileRaw.trim();

            if (cleanBase64.startsWith('"') && cleanBase64.endsWith('"')) {
                cleanBase64 = cleanBase64.slice(1, -1);
            }
            if (cleanBase64.includes(",")) {
                cleanBase64 = cleanBase64.split(",")[1];
            }

            cleanBase64 = cleanBase64
                .replace(/\\r\\n/g, "")
                .replace(/\\n/g, "")
                .replace(/[\r\n]/g, "")
                .trim();

            const byteCharacters = atob(cleanBase64);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: this._mimeType || "application/octet-stream" });

            const blobUrl = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = blobUrl;
            link.download = this._fileName || "document.pdf";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);
        } catch (error) {
            console.error("Error processing file:", error);
            alert("Неможливо відкрити файл. Перевірте формат даних.");
        }
    }

    public openFile(fileData: string, fileName: string) {
        if (!fileData) return;

        // Якщо передано внутрішній URL Power Apps (appres://)
        if (fileData.startsWith("appres://") || fileData.startsWith("http")) {
            window.open(fileData, "_blank");
            return;
        }

        // Якщо передано чистий Base64
        const cleanBase64 = fileData.includes(",") ? fileData.split(",")[1] : fileData;
        const byteCharacters = atob(cleanBase64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: "application/pdf" });

        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = fileName || "document.pdf";
        link.click();
    }

    public getOutputs(): IOutputs {
        return {};
    }

    public destroy(): void {
        if (this._container && this._cardElement) {
            this._container.removeChild(this._cardElement);
        }
    }
}