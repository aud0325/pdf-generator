# PDF Generator
특정 크기 이상의 html을 pdf로 변환하기 위한 클래스

iOS 모바일 환경에서는 한번에 렌더링 가능한 크기가 제한되어 캔버스를 한번에 만들 수 없음
  - [canvas-size - Test results](https://jhildenbiddle.github.io/canvas-size/#/?id=test-results) 참고

HTML 엘리먼트를 최대한 큰 캔버스로 나눠 PDF 형식으로 변경 

### 예시
```javascript
import PdfGenerator from 'pdf-generator';

const pdfGenerator =  new PdfGenerator({
    pageWidth: 1920,
    pageHeight: 2720,
});
// size example - 1920 * 54440
const element = document.querySelector('#pdf-container');

const pdfDoc = await pdfGenerator.makePdf(element);

window.open(pdfDoc.output("bloburl"));

```

### [상세 정보](https://rowan-apricot-295.notion.site/html2canvas-pdf-1353963bcee3806cab3ce6244f49162d)