import html2canvas, {Options} from "html2canvas";
import jsPDF from "jspdf";
import canvasSize from "canvas-size";

class PdfGenerator {
    constructor({
        pageWidth,
        pageHeight,
        pdfWidth = 210,
        pdfHeight = 297,
        orientation = 'p',
        unit = 'mm',
        imageType = 'jpeg',
        quality = 1,
        scale = 1,
                }) {
        this.isFirstPage = true;
        // html 한페이지당 크기 (px)
        this.pageWidth = pageWidth;
        this.pageHeight = pageHeight;

        // PDF 가로/세로 (mm)
        this.pdfWidth = pdfWidth;
        this.pdfHeight = pdfHeight;

        // 용량 최적화
        this.imageType = imageType;
        this.quality = quality;

        // canvas scale
        this.scale = scale;

        this.pdf = new jsPDF(orientation, unit, [pdfWidth, pdfHeight]);
    }

    /**
     * get jsPDF object
     * @returns {jsPDF}
     */
    getPdf() {
        return this.pdf;
    }

    /**
     * 특정 노드/엘리먼트를 이미지로 저장해서 리턴
     * 기기 환경에 따라 canvas를 여러개로 분리해서 렌더링
     * @param {HTMLElement | ChildNode} node
     */
    async makePdf(node) {
        // 현재 기기에서 지원하는 최대 pdf canvas 사이즈 확인
        const maxHeight = await this.findCanvasMaxSize(node.offsetHeight);
        // 지원되는 maxHeight으로 그려야하는 캔버스 개수 확인
        let canvasCount = node.offsetHeight / maxHeight;

        let canvasHeight;
        for (let i = 0; i < canvasCount; i++) {
            if (canvasCount - i < 1) {
                // 마지막 루프인 경우 - canvasCount가 1.75같은 소수점일 수 있어서, 마지막 캔버스는 0.75(남은 높이)만큼만 렌더링 후 반올림처리
                canvasHeight = Math.round(maxHeight * (canvasCount - i));
            } else {
                canvasHeight = maxHeight;
            }
            // 캔버스로 pdf 페이지 생성
            await this._addPage(node, {
                x: 0,
                y: i * maxHeight,
                width: this.pageWidth,
                height: canvasHeight,
            })
        }
        return this.pdf;
    }

    /**
     * 현재 기기의 최대 렌더링 가능한 캔버스 사이즈를 찾는다. (pdf용 페이지 기준)
     * 렌더링 가능한 사이즈가 나올때 까지 한페이지씩 높이 줄여서 탐색
     * @param {number} height
     * @returns {Promise<number>}
     */
    async findCanvasMaxSize(height) {
        // width는 고정, 높이만 조절해서 확인
        const testResult = await canvasSize.test({
            width: this.pageWidth,
            height: height,
        });

        if (testResult.success) return height;
        if (height <= this.pageHeight) return this.pageHeight;

        // 한페이지씩 크기를 줄여가며 확인
        return this.findCanvasMaxSize(height - this.pageHeight);
    }

    /**
     * node를 canvas > image 변환 후 pdf에 추가하는 함수
     * canvas로 그릴 수 있는 범위를 페이지별로 pdf에 추가한다.
     * @param {HTMLElement | ChildNode} node
     * @param {Options} canvasOptions
     */
    async _addPage(node, canvasOptions) {
        // node에서 인자로 받은 크기만큼 캔버스로 생성
        const canvas = await html2canvas(node, {
            ...canvasOptions,
            scale: this.scale,
        });
        const imageFile = canvas.toDataURL(`image/${this.imageType}`, this.quality);

        // page별 높이만큼 페이지 개수 계산
        let pageCount = canvasOptions.height / this.pageHeight;
        for (let i = 0; i < pageCount; i++) {
            console.log('add pdf image', i, pageCount);
            // 2번째 페이지부터는 pdf페이지 추가
            if (this.isFirstPage) {
                this.isFirstPage = false;
            } else {
                this.pdf.addPage();
            }

            // PDF 이미지 추가
            this.pdf.addImage(
                imageFile,
                `${this.imageType}`,
                0, // positionX
                -(i * this.pdfHeight),  // positionY
                this.pdfWidth, // width
                this.pdfHeight * pageCount); // height > 이미지의 전체 높이. 실제 로직은 pdf 넓이*실제페이지 비율
        }
    }
}

export default PdfGenerator;