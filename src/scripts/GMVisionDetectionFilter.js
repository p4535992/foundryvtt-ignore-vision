export class GMVisionDetectionFilter extends AbstractBaseFilter {
    /** @type {GMVisionDetectionFilter} */
    static #instance;

    /**
     * The instance of this shader.
     * @type {GMVisionDetectionFilter}
     */
    static get instance() {
        return (this.#instance ??= this.create());
    }

    /** @override */
    static defaultUniforms = {
        alphaScale: 1,
        alphaThreshold: 0.6,
        outlineColor: [1, 1, 1, 1],
        thickness: 1,
    };

    /** @override */
    static vertexShader = `\
        attribute vec2 aVertexPosition;

        uniform vec4 inputSize;
        uniform vec4 outputFrame;
        uniform mat3 projectionMatrix;

        varying vec2 vTextureCoord;

        void main() {
            vTextureCoord = aVertexPosition * (outputFrame.zw * inputSize.zw);
            vec2 position = aVertexPosition * max(outputFrame.zw, vec2(0.)) + outputFrame.xy;
            gl_Position = vec4((projectionMatrix * vec3(position, 1.0)).xy, 0.0, 1.0);
        }`;

    /** @override */
    static get fragmentShader() {
        return `\
            varying vec2 vTextureCoord;

            uniform sampler2D uSampler;
            uniform vec4 inputPixel;
            uniform vec4 inputClamp;
            uniform vec4 outlineColor;
            uniform float thickness;
            uniform float alphaScale;
            uniform float alphaThreshold;

            float sampleAlpha(vec2 textureCoord) {
                return smoothstep(alphaThreshold, 1.0, alphaScale * texture2D(uSampler, clamp(textureCoord, inputClamp.xy, inputClamp.zw)).a);
            }

            void main(void) {
                float innerAlpha = sampleAlpha(vTextureCoord);
                float outerAlpha = innerAlpha;

                for (float angle = 0.0; angle < ${(2 * Math.PI - this.#quality / 2).toFixed(
                    7,
                )}; angle += ${this.#quality.toFixed(7)}) {
                    vec2 offset = inputPixel.zw * vec2(cos(angle), sin(angle)) * thickness;
                    outerAlpha = max(outerAlpha, sampleAlpha(vTextureCoord + offset));
                }

                vec2 pixelCoord = vTextureCoord * inputPixel.xy;
                float hatchAlpha = thickness > 1.0 ? smoothstep(0.0, 1.0, sin(2.2214415 / thickness * (pixelCoord.x + pixelCoord.y)) + 0.5) : 0.5;

                gl_FragColor = outlineColor * (max((1.0 - innerAlpha) * outerAlpha, innerAlpha * hatchAlpha * 0.5) * 0.5);
            }`;
    }

    /**
     * Quality of the outline according to performance mode.
     * @returns {number}
     */
    static get #quality() {
        switch (canvas.performance.mode) {
            case CONST.CANVAS_PERFORMANCE_MODES.LOW:
                return (Math.PI * 2) / 8;
            case CONST.CANVAS_PERFORMANCE_MODES.MED:
                return (Math.PI * 2) / 12;
            default:
                return (Math.PI * 2) / 16;
        }
    }

    /** @override */
    static create(uniforms) {
        const shader = super.create(uniforms);

        shader.#updatePadding();

        return shader;
    }

    #updatePadding() {
        this.padding = this.uniforms.thickness;
    }

    /**
     * The thickness of the outline.
     * @returns {number}
     */
    get thickness() {
        return this.uniforms.thickness;
    }

    set thickness(value) {
        this.uniforms.thickness = value;
        this.#updatePadding();
    }

    /** @override */
    get autoFit() {
        return this.uniforms.thickness <= 1;
    }

    set autoFit(value) {}

    /** @override */
    apply(filterManager, input, output, clear, currentState) {
        this.uniforms.alphaScale = 1 / (currentState.target.worldAlpha || 1);
        filterManager.applyFilter(this, input, output, clear);
    }
}
