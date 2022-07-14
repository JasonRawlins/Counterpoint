import * as Phaser from "phaser";
//import * as dat from "dat.gui";
import { Exercise, Voice, VoicePosition } from "../music/counterpoint";
import { Clef, Interval, Key, Note } from "../music/core";
import * as validation from "../music/validation";

const screenSize = { width: 675, height: 200 };
const wholeNoteHeight = 12; // The height of the whole note image in pixels. 
const halfWholeNoteHeight = wholeNoteHeight / 2;
const wholeNoteWidth = 21;
const unit = (wholeNoteHeight / screenSize.height) * 100;
const altoClefTopOffset = 18 * unit;

const style = {
  padding: {
    left: 10
  }
};

//interface IPitchYInSemitones {
//    treble: { c6: number, b5: number, a5: number, g5: number, f5: number, e5: number, d5: number, c5: number, b4: number, a4: number, g4: number, f4: number, e4: number, d4: number, c4: number, b3: number, a3: number },
//    alto: {}
//}

const pitchYInSemitones = {
  treble: {
    c6: 0,
    b5: 1,
    a5: 2,
    g5: 3,
    f5: 4,
    e5: 5,
    d5: 6,
    c5: 7,
    b4: 8,
    a4: 9,
    g4: 10,
    f4: 11,
    e4: 12,
    d4: 13,
    c4: 14,
    b3: 15,
    a3: 16
  },
  alto: {
    d5: 0,
    c5: 1,
    b4: 2,
    a4: 3,
    g4: 4,
    f4: 5,
    e4: 6,
    d4: 7,
    c4: 8,
    b3: 9,
    a3: 10,
    g3: 11,
    f3: 12,
    e3: 13,
    d3: 14,
    c3: 15
  }
}

const possibleLedgerLines = [
  pitchYInSemitones.treble.a3,
  pitchYInSemitones.treble.a5,
  pitchYInSemitones.treble.c6,
  pitchYInSemitones.alto.d3,
  pitchYInSemitones.alto.b4,
  pitchYInSemitones.alto.d5,
];

function noteFromSemitones(clef: {}, semitones: number) {
  var clefKey = Object.keys(clef).find(k => (clef as any)[k] as number === semitones); // Somenone kick my ass for writing something like this.
  return new Note(clefKey || "");
}

function semitonesFromNote(clef: {}, note: Note) {
  return (clef as any)[note.toString()] as number;
}

const constants = {
  DATA: "DATA",
  pitch: {
    F5: "F5",
    E5: "E5",
    D5: "D5",
    C5: "C5",
    B4: "B4",
    A4: "A4",
    G4: "G4",
    F4: "F4",
    E4: "E4",
    D4: "F4"
  },
  terms: {
    GHOST_NOTE: "ghost-note",
    LEDGER_LINE: "ledger-line",
    MEASURE_DATA: "measure-data",
    NOTE: "note",
    PITCH: "pitch",
    VALIDATION_MARKUP: "validation-markup",
    WHOLE_NOTE: "whole-note"
  }
};

class MeasureData {
  constructor(public note: Note, public number: number, public isCantusFirmus: boolean) { }
}

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
  active: false,
  visible: false,
  key: "Game"
};

export default class MainScene extends Phaser.Scene {
  private controls!: Phaser.Cameras.Controls.SmoothedKeyControl;
  private mainContainer!: Phaser.GameObjects.Container;
  //private gui: dat.GUI;
  private feedbackText!: Phaser.GameObjects.Text;
  private ghostNoteImage!: Phaser.GameObjects.Image;

  private exercise = new Exercise(Key.c,
    new Voice(VoicePosition.bottom, Clef.alto, "c4 d4 e4 f4 g4 d4 f4 e4 d4 c4", true),
    new Voice(VoicePosition.top, Clef.treble, "g4 a4 b4 c5 b4 g4 a4 c5 b4 a4")
  );

  private measureLeftOffset = 70;
  private measureWidth = (screenSize.width - this.measureLeftOffset) / this.exercise.length;
  private leftOffset = style.padding.left + this.measureLeftOffset + this.exercise.length * this.measureWidth;

  constructor() {
    super(sceneConfig);
    //this.gui = new dat.GUI();
  }

  public preload() {
    this.load.multiatlas("musical-symbols", "assets/musical-symbols.json", "assets");
    this.load.audio("d3", "assets/audio/d3.mp3");
    this.load.audio("e3", "assets/audio/e3.mp3");
    this.load.audio("f3", "assets/audio/f3.mp3");
    this.load.audio("g3", "assets/audio/g3.mp3");
    this.load.audio("a3", "assets/audio/a3.mp3");
    this.load.audio("b3", "assets/audio/b3.mp3");
    this.load.audio("c4", "assets/audio/c4.mp3");
    this.load.audio("d4", "assets/audio/d4.mp3");
    this.load.audio("e4", "assets/audio/e4.mp3");
    this.load.audio("f4", "assets/audio/f4.mp3");
    this.load.audio("g4", "assets/audio/g4.mp3");
    this.load.audio("a4", "assets/audio/a4.mp3");
    this.load.audio("b4", "assets/audio/b4.mp3");
    this.load.audio("c5", "assets/audio/c5.mp3");
    this.load.audio("d5", "assets/audio/d5.mp3");
    this.load.audio("e5", "assets/audio/e5.mp3");
    this.load.audio("f5", "assets/audio/f5.mp3");
    this.load.audio("g5", "assets/audio/g5.mp3");
    this.load.audio("a5", "assets/audio/a5.mp3");
  }

  public create() {
    this.renderDiagnosticsScreen();

    const cursors = this.input.keyboard.createCursorKeys();
    const controlConfig = {
      camera: this.cameras.main,
      left: cursors.left,
      right: cursors.right,
      up: cursors.up,
      down: cursors.down,
      zoomIn: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q),
      zoomOut: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E),
      acceleration: 0.06,
      drag: 0.0005,
      maxSpeed: 1.0
    };
    this.controls = new Phaser.Cameras.Controls.SmoothedKeyControl(controlConfig);

    this.mainContainer = this.add.container(0, 0);

    this.renderGrandStaff();
    this.renderMeasures();
    this.renderLedgerLines();
    this.renderTransportControls();

    this.feedbackText = this.add.text(0, 250, "Feedback", { color: "#000000" });
    this.mainContainer.add(this.feedbackText);
  }

  renderTransportControls() {
    const playButton = this.add.triangle(style.padding.left, 30 * unit, 0, 0, 50, 25, 0, 50, 0x00FF00).setOrigin(0);
    playButton.setInteractive();
    playButton.on("pointerdown", () => {
      let measureNumber = 0;
      const intervalHandle = setInterval(() => {
        const cantusFirmusNoteSound = this.sound.add(this.exercise.cantusFirmus.notes[measureNumber].toString());
        const counterpointNoteSound = this.sound.add(this.exercise.counterpoint.notes[measureNumber].toString());

        cantusFirmusNoteSound.play();
        counterpointNoteSound.play();

        measureNumber++;
        if (measureNumber >= this.exercise.cantusFirmus.notes.length) {
          clearInterval(intervalHandle);
        }
      }, 500);
    });

    this.mainContainer.add(playButton);
  }

  public update(time: number, delta: number) {
    this.controls.update(delta);
    this.renderLedgerLines();
    this.validateExercise();
  }

  renderGrandStaff() {
    const grandStaffTop = pitchYInSemitones.treble.f5 * unit;
    const grandStaffBottom = grandStaffTop + altoClefTopOffset + (pitchYInSemitones.treble.e4 - pitchYInSemitones.alto.f3) + 4 * unit;

    const beginningBarLine = this.add.line(style.padding.left, grandStaffTop, 0, 0, 0, grandStaffBottom, 0x000000).setOrigin(0);
    const endBarline1 = this.add.line(this.leftOffset + 7, grandStaffTop, 0, 0, 0, grandStaffBottom, 0x000000).setOrigin(0);
    endBarline1.setLineWidth(3);
    const endBarline2 = this.add.line(this.leftOffset, grandStaffTop, 0, 0, 0, grandStaffBottom, 0x000000).setOrigin(0);

    // TODO: What is 6.1?
    const trebleTimeSignature = this.add.image(9.5 * unit, 6.1 * unit, "musical-symbols", "common-time.png").setOrigin(0);
    const trebleTimeSignatureToWholeNoteRatio = 0.155;
    trebleTimeSignature.setScale(trebleTimeSignatureToWholeNoteRatio * unit);

    // Treble staff
    // TODO: What is 1.3?
    const trebleClef = this.add.image(3 * unit, 1.3 * unit, "musical-symbols", "treble-clef.png").setOrigin(0);
    const trebleClefToWholeNoteRatio = 0.166;
    trebleClef.setScale(trebleClefToWholeNoteRatio * unit);

    const trebleF5Line = this.createStaffLine(pitchYInSemitones.treble.f5);
    const trebleD5Line = this.createStaffLine(pitchYInSemitones.treble.d5);
    const trebleB4Line = this.createStaffLine(pitchYInSemitones.treble.b4);
    const trebleG4Line = this.createStaffLine(pitchYInSemitones.treble.g4);
    const trebleE4Line = this.createStaffLine(pitchYInSemitones.treble.e4);

    // Alto clef
    // TODO: What is 6.1?
    const altoTimeSignature = this.add.image(9.5 * unit, altoClefTopOffset + 6.1 * unit, "musical-symbols", "common-time.png").setOrigin(0);
    const altoTimeSignatureToWholeNoteRatio = 0.155;
    altoTimeSignature.setScale(altoTimeSignatureToWholeNoteRatio * unit);

    // TODO: What is 4?
    const altoClef = this.add.image(3 * unit, altoClefTopOffset + 4 * unit, "musical-symbols", "alto-clef.png").setOrigin(0);
    const altoClefToWholeNoteRatio = 0.153;
    altoClef.setScale(altoClefToWholeNoteRatio * unit);

    const altoG4Line = this.createStaffLine(pitchYInSemitones.alto.g4, altoClefTopOffset);
    const altoE4Line = this.createStaffLine(pitchYInSemitones.alto.e4, altoClefTopOffset);
    const altoC4Line = this.createStaffLine(pitchYInSemitones.alto.c4, altoClefTopOffset);
    const altoA4Line = this.createStaffLine(pitchYInSemitones.alto.a3, altoClefTopOffset);
    const altoF3Line = this.createStaffLine(pitchYInSemitones.alto.f3, altoClefTopOffset);

    this.mainContainer.add([
      beginningBarLine,
      trebleClef,
      trebleF5Line, trebleD5Line, trebleB4Line, trebleG4Line, trebleE4Line,
      altoClef,
      altoG4Line, altoE4Line, altoC4Line, altoA4Line, altoF3Line,
      endBarline1, endBarline2
    ]);
  }

  createStaffLine(pitchYInSemitones: number, yOffset: number = 0) {
    return this.add.line(style.padding.left, pitchYInSemitones * unit + yOffset, 0, 0, this.leftOffset, 0, 0x000000).setOrigin(0);
  }

  renderMeasures() {
    this.exercise.cantusFirmus.notes.forEach((note: Note, measureNumber: number) => {
      const measureLeft = style.padding.left + this.measureLeftOffset + this.measureWidth * measureNumber;
      const measureCenterX = (measureLeft + this.measureWidth / 2) - 2 * unit;
      const noteY = altoClefTopOffset + ((pitchYInSemitones.alto as any)[note.toString()] as number) * unit - halfWholeNoteHeight;

      if (measureNumber > 0) {
        const measureBottom = (pitchYInSemitones.alto.f3 - pitchYInSemitones.alto.g4) * unit;
        const line = this.add.line(measureLeft, altoClefTopOffset + pitchYInSemitones.alto.g4 * unit, 0, 0, 0, measureBottom, 0x000000).setOrigin(0);
        this.mainContainer.add(line);
        this.add.text(measureLeft + 3, 8, (measureNumber + 1).toString(), { color: "0x000000", fontSize: "16" }).setOrigin(0);
      }

      const measureCantusFirmusNote = this.renderNote(measureCenterX, noteY, new MeasureData(note, measureNumber, true));
      this.mainContainer.add(measureCantusFirmusNote);
    });

    this.exercise.counterpoint.notes.forEach((note: Note, measureNumber: number) => {
      const measureLeft = style.padding.left + this.measureLeftOffset + this.measureWidth * measureNumber;

      const measureDisplay = this.add.rectangle(measureLeft, 0, this.measureWidth, (pitchYInSemitones.treble.a3 - pitchYInSemitones.treble.c6) * unit, 0xffffff).setOrigin(0);
      measureDisplay.setInteractive();
      measureDisplay.setAlpha(0.2);
      measureDisplay.setData(constants.terms.MEASURE_DATA, new MeasureData(note, measureNumber, false));
      this.mainContainer.add(measureDisplay);
      const measureCenterX = (measureDisplay.x + this.measureWidth / 2) - 2 * unit;

      if (note) {
        const noteY = ((pitchYInSemitones.treble as any)[note.toString()] as number) * unit - halfWholeNoteHeight;
        const counterpointNote = this.exercise.counterpoint.notes[measureNumber];
        if (counterpointNote) {
          const measureCounterpointNote = this.renderNote(measureCenterX, noteY, new MeasureData(note, measureNumber, false))
          this.mainContainer.add(measureCounterpointNote);
        }
      }

      if (measureNumber > 0) {
        const measureBottom = (pitchYInSemitones.treble.e4 - pitchYInSemitones.treble.f5) * unit;
        const line = this.add.line(measureLeft, pitchYInSemitones.treble.f5 * unit, 0, 0, 0, measureBottom, 0x000000).setOrigin(0);
        this.mainContainer.add(line);
      }

      measureDisplay.on("pointermove", (pointer: Phaser.Input.Pointer, currentlyOver: Phaser.GameObjects.GameObject[]) => {
        const semitones = Math.round(pointer.y / unit);
        const note = noteFromSemitones(pitchYInSemitones.treble, semitones);
        const pitchInPixels = semitones * unit - halfWholeNoteHeight;

        if (this.ghostNoteImage) {
          this.ghostNoteImage.destroy();
        }

        this.ghostNoteImage = this.renderNote(measureCenterX, pitchInPixels, new MeasureData(note, measureNumber, false));

        this.ghostNoteImage.name = constants.terms.GHOST_NOTE;
        this.ghostNoteImage.alpha = 0.5;
        this.mainContainer.add(this.ghostNoteImage);
      });

      measureDisplay.on("pointerout", () => {
        this.ghostNoteImage.destroy();
      });

      measureDisplay.on("pointerdown", () => {
        const semitones = Math.round((this.ghostNoteImage.y + halfWholeNoteHeight) / unit);
        const note = noteFromSemitones(pitchYInSemitones.treble, semitones);
        const pitchInPixels = semitones * unit - halfWholeNoteHeight;
        this.exercise.counterpoint.removeNote(measureNumber);
        this.exercise.counterpoint.addNote(measureNumber, note);

        const placedNoteSound = this.sound.add(note.toString());
        placedNoteSound.play();

        const noteGameObjects = this.getNoteGameObjects(measureNumber);

        if (noteGameObjects.length > 0) {
          noteGameObjects[0].destroy();
        }

        this.mainContainer.add(this.renderNote(measureCenterX, pitchInPixels, new MeasureData(note, measureNumber, false)));
      });
    });
  }

  getNoteGameObjects(measureNumber?: number) {
    return this.mainContainer.list.filter(gameObject => {
      if (!gameObject.name.includes(constants.terms.NOTE) || gameObject.name.includes(constants.terms.GHOST_NOTE))
        return false;

      const measureData = gameObject.getData(constants.terms.MEASURE_DATA) as MeasureData;

      if (!measureData)
        return false;

      if (measureNumber !== undefined && measureNumber !== measureData.number)
        return false;

      return !measureData.isCantusFirmus;
    }) as Phaser.GameObjects.Image[];
  }

  renderNote(x: number, y: number, measureData: MeasureData) {
    // What is 2? Just pixel pushing?
    const noteImage = this.add.image(x + 2, y, "musical-symbols", "whole-note.png").setOrigin(0);
    noteImage.name = constants.terms.NOTE;
    noteImage.setData(constants.terms.MEASURE_DATA, measureData);

    return noteImage;
  }

  renderLedgerLines() {
    // Remove all ledger lines.
    this.mainContainer.list.filter(gameObject => {
      if (gameObject.name.includes(constants.terms.LEDGER_LINE) && !gameObject.name.includes(constants.terms.GHOST_NOTE)) {
        gameObject.destroy();
      }
    });

    if (this.ghostNoteImage) {
      const measureData = this.ghostNoteImage.getData(constants.terms.MEASURE_DATA) as MeasureData;

      if (measureData?.note) {
        this.renderLedgerLine(pitchYInSemitones.treble, measureData.note, measureData.number, 0, 0.5);
      }
    }

    this.exercise.cantusFirmus.notes.forEach((note: Note, measureNumber: number) => {
      this.renderLedgerLine(pitchYInSemitones.alto, note, measureNumber, altoClefTopOffset);
    });

    this.exercise.counterpoint.notes.forEach((note: Note, measureNumber: number) => {
      if (note) {
        this.renderLedgerLine(pitchYInSemitones.treble, note, measureNumber);
      }
    });
  }

  renderLedgerLine(pitchYInSemitones: {}, note: Note, measureNumber: number, topOffset: number = 0, alpha: number = 1) {
    // Get x and y for each note
    const noteInSemitones = semitonesFromNote(pitchYInSemitones, note);
    const y = noteInSemitones * unit + topOffset

    if (possibleLedgerLines.includes(noteInSemitones)) {
      const x = this.measureLeftOffset + this.measureWidth * measureNumber + this.measureWidth / 2;
      //console.log(`topOffset: ${topOffset} | x: ${x} | y: ${y} | note: ${note.toString()}`);

      const ledgerLine = this.add.line(x - 2, y, 0, 0, wholeNoteWidth + 4, 0, 0x000000).setOrigin(0);
      ledgerLine.name = constants.terms.LEDGER_LINE;
      ledgerLine.alpha = alpha;
      this.mainContainer.add(ledgerLine);
    }
  }

  displayMultiMeasureValidation = (preamble: string, selector: string, noErrorsMessage: string, validatedMeasures: number[]) => {
    const displayElement = document.getElementById(selector);
    let validationMessage = preamble + " in measures ";
    validatedMeasures.forEach(measureNumber => {
      validationMessage += `(${measureNumber + 1} and ${measureNumber + 2}), `;
    });

    if (validatedMeasures.length > 0) {
      displayElement!.innerHTML = validationMessage.substring(0, validationMessage.length - 2);
    } else {
      displayElement!.innerHTML = noErrorsMessage;
    }
  }

  displaySingleMeasureValidation = (preamble: string, selector: string, noErrorsMessage: string, validatedMeasures: number[], measureCountThreshold: number = 0) => {
    const displayElement = document.getElementById(selector);
    let validationMessage = preamble + " in measure(s) ";
    validatedMeasures.forEach(measureNumber => {
      validationMessage += `${measureNumber + 1}, `;
    });

    if (validatedMeasures.length > measureCountThreshold) {
      displayElement!.innerHTML = validationMessage.substring(0, validationMessage.length - 2);
    } else {
      displayElement!.innerHTML = noErrorsMessage;
    }
  }

  //displaySingleMeasureValidation = (preamble: string, selector: string, noErrorsMessage: string, validatedMeasures: number[]) => {
  //  const displayElement = document.getElementById(selector);
  //  let validationMessage = preamble + " in measure(s) ";
  //  validatedMeasures.forEach(measureNumber => {
  //    validationMessage += `${measureNumber + 1}, `;
  //  });

  //  if (validatedMeasures.length > 0) {
  //    displayElement!.innerHTML += validationMessage.substring(0, validationMessage.length - 2);
  //  } else {
  //    displayElement!.innerHTML = noErrorsMessage;
  //  }
  //}

  validateExercise() {
    this.displayMultiMeasureValidation("Parallel octaves ", "parallel-octaves", "No parallel octaves", validation.getParallelOctaves(this.exercise));
    this.displayMultiMeasureValidation("Hidden octaves ", "hidden-octaves", "No hidden octaves", validation.getHiddenOctaves(this.exercise));
    this.displayMultiMeasureValidation("Parallel fifths ", "parallel-fifths", "No parallel fifths", validation.getParallelFifths(this.exercise));
    this.displayMultiMeasureValidation("Hidden fifths ", "hidden-fifths", "No hidden fifths", validation.getHiddenFifths(this.exercise));
    this.displaySingleMeasureValidation("Dissonant interval ", "dissonant-intervals", "No dissonant intervals", validation.getDissonantIntervals(this.exercise));
    this.displaySingleMeasureValidation("Multiple high points ", "multiple-high-points", "Single high point", validation.getHighpoints(this.exercise), 1);
    this.displaySingleMeasureValidation("Crossed voices ", "crossed-voices", "No crossed voices", validation.getCrossedVoices(this.exercise));


    //validation.getDissonantIntervals(this.exercise).forEach(measureNumber => {
    //    this.renderDissonantIntervalErrors(measureNumber, "Dissonant");
    //});
  }

  //private renderParallelPerfectErrors(measureNumber: number, errorMessage: string) {
  //  const firstMeasureNote = this.getNoteGameObjects(measureNumber)[0];
  //  const secondMeasureNote = this.getNoteGameObjects(measureNumber + 1)[0];

  //  const x1 = firstMeasureNote.x + wholeNoteWidth + 2;
  //  const x2 = secondMeasureNote.x - 2;
  //  const y1 = firstMeasureNote.y + wholeNoteHeight / 2;
  //  const y2 = secondMeasureNote.y + wholeNoteHeight / 2;

  //  const errorLine = this.add.line(0, 0, x1, y1, x2, y2, 0xFF0000).setOrigin(0);
  //  errorLine.name = constants.terms.VALIDATION_MARKUP;
  //  this.mainContainer.add(errorLine);

  //  const errorMessageDisplayRadius = 7;
  //  const xMidpoint = (x1 + (x2 - x1) / 2) - errorMessageDisplayRadius;
  //  const yMidpoint = (y1 + (y2 - y1) / 2) - errorMessageDisplayRadius;

  //  const errorMessageDisplay = this.add.circle(xMidpoint, yMidpoint, errorMessageDisplayRadius, 0xFF0000).setOrigin(0);
  //  errorMessageDisplay.name = constants.terms.VALIDATION_MARKUP;
  //  errorMessageDisplay.setInteractive();
  //  this.mainContainer.add(errorMessageDisplay);

  //  let errorMessagePopup = this.add.text(xMidpoint, yMidpoint, errorMessage);
  //  errorMessagePopup.name = constants.terms.VALIDATION_MARKUP;
  //  this.mainContainer.add(errorMessagePopup);
  //}

  //private renderDissonantIntervalErrors(measureNumber: number, errorMessage: string) {
  //  const x = style.padding.left + this.measureLeftOffset + this.measureWidth * measureNumber;
  //  const y = 5;
  //  const errorMessageText = this.add.text(x, y, errorMessage);
  //  errorMessageText.name = constants.terms.VALIDATION_MARKUP;
  //  this.mainContainer.add(errorMessageText);
  //}

  renderDiagnosticsScreen() {
    //const camera = this.cameras.main;

    //const help = {
    //    line1: "Cursors to move",
    //    line2: "Q & E to zoom"
    //};

    //const f1 = this.gui.addFolder('Camera');
    //f1.add(camera, 'x').listen();
    //f1.add(camera, 'y').listen();
    //f1.add(camera, 'scrollX').listen();
    //f1.add(camera, 'scrollY').listen();
    //f1.add(camera, 'rotation').min(0).step(0.01).listen();
    //f1.add(camera, 'zoom', 0.1, 2).step(0.1).listen();
    //f1.add(help, 'line1');
    //f1.add(help, 'line2');
    //f1.open();
  }
}
