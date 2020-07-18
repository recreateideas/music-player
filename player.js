const { Board, Led, Piezo, Button, Sensor } = require("johnny-five");
const { songGenerator } = require('./utils');
const songs = require('./songs');
require('tty');

const board = new Board();

const { log } = console;

const onSongEnd = () => {
    log('song finished.');
};

const main = () => {
    const potentiometer = new Sensor('A0');
    const ledPin = new Led(9);
    const changePin = new Led(10);
    const piezo = new Piezo(11);
    const playButton = new Button({ pin: 12, isPullup: true });
    const changeButton = new Button({ pin: 2, isPullup: true });
    let tempo = 100;
    const getSong = songGenerator(songs);
    let { value: { song, songName } } = getSong.next();
    const playSong = () => {
        piezo.stop();
        piezo.play({ song, tempo }, () => onSongEnd())
        log(`Playing song: '${songName}'`);
    };
    const stopSong = () => piezo.stop();
    const changeSong = () => {
        const newSong = getSong.next().value;
        song = newSong.song;
        songName = newSong.songName;
        changePin.brightness(255);
        log(`Selected song -> '${songName}'`);
    };
    const changeTempo = () => {
        const { value } = potentiometer;
        const delta = Math.abs(value - tempo);
        if (delta > 10) {
            tempo = Math.ceil(value);
            ledPin.brightness(tempo - 20);
            log(`changing tempo to: ${tempo}bpmm`);
        }
    }
    const startUserInput = () => {
        const stdin = process.openStdin();
        log(`
        Songs: ${Object.keys(songs).join(', ')}
        Press space to play '${songName}'...`);
        stdin.on('keypress', (chunk, key) => {
            switch(key.name) {
                case 'space': 
                    log(`Playing '${songName}' at ${tempo}bpm ... Press 'q' to stop.`);
                    playSong();
                    break;
                case 'q':
                    stopSong();
                    break;
                case 'right':
                    stopSong();
                    changeSong();
                    break;
                default: break;
            }
            if (key && key.ctrl && key.name == 'c') process.exit();
        });
    }
    playButton.on("down", playSong);
    playButton.on("up", stopSong);
    changeButton.on("down", changeSong);
    changeButton.on("up", () => changePin.brightness(0));
    potentiometer.scale(50, 255).on('change', changeTempo)
    startUserInput();
};

board.on("ready", main);
