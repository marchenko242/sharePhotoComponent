import { IInputs, IOutputs } from "./generated/ManifestTypes";

export class SharePhoto implements ComponentFramework.StandardControl<IInputs, IOutputs> {
    private _container: HTMLDivElement;
    private _context: ComponentFramework.Context<IInputs>;
    private _imageElement: HTMLImageElement;

    private _overlay: HTMLDivElement;
    private _overlayImage: HTMLImageElement;
    private _overlayHint: HTMLDivElement;
    private _overlayCloseBtn: HTMLDivElement;

    private _cleanUrl: string | null = null;

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
        this._container.style.cursor = "pointer";
        this._container.style.position = "relative";

        this._imageElement = document.createElement("img");
        this._imageElement.style.maxWidth = "100%";
        this._imageElement.style.maxHeight = "100%";
        this._imageElement.style.objectFit = "contain";
        this._imageElement.style.display = "block";
        this._container.appendChild(this._imageElement);

        this._container.addEventListener("click", () => {
            this._openOverlay();
        });

        this._buildOverlay();
    }

    
    private _buildOverlay(): void {
        this._overlay = document.createElement("div");
        this._overlay.style.position = "fixed";
        this._overlay.style.top = "0";
        this._overlay.style.left = "0";
        this._overlay.style.width = "100vw";
        this._overlay.style.height = "100vh";
        this._overlay.style.background = "rgba(0,0,0,0.92)";
        this._overlay.style.display = "none";
        this._overlay.style.flexDirection = "column";
        this._overlay.style.alignItems = "center";
        this._overlay.style.justifyContent = "center";
        this._overlay.style.zIndex = "999999";
        this._overlay.style.padding = "16px";
        this._overlay.style.boxSizing = "border-box";

        this._overlayImage = document.createElement("img");
        this._overlayImage.style.maxWidth = "100%";
        this._overlayImage.style.maxHeight = "80vh";
        this._overlayImage.style.objectFit = "contain";
        this._overlayImage.style.borderRadius = "8px";
        
        this._overlayImage.style.setProperty("-webkit-touch-callout", "default");
        (this._overlayImage.style as unknown as Record<string, string>)["userSelect"] = "auto";

        this._overlayHint = document.createElement("div");
        this._overlayHint.textContent = "Press and hold the photo to share or save it.";
        this._overlayHint.style.color = "#fff";
        this._overlayHint.style.fontSize = "15px";
        this._overlayHint.style.marginTop = "16px";
        this._overlayHint.style.textAlign = "center";

        this._overlayCloseBtn = document.createElement("div");
        this._overlayCloseBtn.textContent = "Close";
        this._overlayCloseBtn.style.color = "#fff";
        this._overlayCloseBtn.style.fontSize = "16px";
        this._overlayCloseBtn.style.fontWeight = "600";
        this._overlayCloseBtn.style.marginTop = "24px";
        this._overlayCloseBtn.style.padding = "10px 24px";
        this._overlayCloseBtn.style.border = "1px solid rgba(255,255,255,0.4)";
        this._overlayCloseBtn.style.borderRadius = "20px";

        this._overlayCloseBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            this._closeOverlay();
        });
        this._overlay.addEventListener("click", (e) => {
            if (e.target === this._overlay) {
                this._closeOverlay();
            }
        });

        this._overlay.appendChild(this._overlayImage);
        this._overlay.appendChild(this._overlayHint);
        this._overlay.appendChild(this._overlayCloseBtn);

        document.body.appendChild(this._overlay);
    }

    private _openOverlay(): void {
        if (!this._cleanUrl) {
            alert("The image has not loaded yet.");
            return;
        }
        this._overlayImage.src = this._cleanUrl;
        this._overlay.style.display = "flex";
    }

    private _closeOverlay(): void {
        this._overlay.style.display = "none";
    }

    public updateView(context: ComponentFramework.Context<IInputs>): void {
        this._context = context;
        const raw = context.parameters.sampleProperty.raw;

        if (!this._imageElement || !raw) {
            return;
        }

        const cleanUrl = this._cleanRawValue(raw);

        if (this._cleanUrl !== cleanUrl) {
            this._cleanUrl = cleanUrl;
            this._imageElement.src = cleanUrl;
        }
    }

    private _cleanRawValue(raw: string): string {
        let cleanUrl = raw.trim();

        if (cleanUrl.startsWith("\"") && cleanUrl.endsWith("\"")) {
            try {
                cleanUrl = JSON.parse(cleanUrl);
            } catch {
                cleanUrl = cleanUrl.slice(1, -1);
            }
        }

        cleanUrl = cleanUrl
            .replace(/\\r\\n/g, "")
            .replace(/\\r/g, "")
            .replace(/\\n/g, "")
            .replace(/[\r\n]/g, "")
            .replace(/\\"/g, "\"")
            .replace(/\\\//g, "/")
            .trim();

        if (
            !cleanUrl.startsWith("data:") &&
            !cleanUrl.startsWith("blob:") &&
            !cleanUrl.startsWith("http") &&
            !cleanUrl.startsWith("app")
        ) {
            cleanUrl = `data:image/jpeg;base64,${cleanUrl}`;
        }

        return cleanUrl;
    }

    public getOutputs(): IOutputs {
        return {};
    }

    public destroy(): void {
        if (this._container && this._imageElement) {
            this._container.removeChild(this._imageElement);
        }
        if (this._overlay && this._overlay.parentElement) {
            this._overlay.parentElement.removeChild(this._overlay);
        }
    }
}