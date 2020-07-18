function* songGenerator(songs) {
    let index = 0;
    while (true) {
        const songNames = Object.keys(songs);
        const songName = songNames[index % songNames.length];
        const song = songs[songName];
        yield { song, songName };
        index++;
    }
};

module.exports = songGenerator;
