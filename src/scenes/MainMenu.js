import { Scene } from 'phaser';

export class MainMenu extends Scene
{
    constructor ()
    {
        super('MainMenu');
    }

    create ()
    {
        this.scene.start('Game');
        // this.add.image(512, 384, 'background');

        // this.add.image(512, 300, 'frame1');

        // this.text = this.add.text(512, 460, 'Main Menu', {
        //     fontFamily: 'Playground', fontSize: 138, color: '#ffffff',
        //     stroke: '#000000', strokeThickness: 8,
        //     align: 'center'
        // }).setOrigin(0.5);

        // console.log(this.text)

        // this.input.once('pointerdown', () => {

        //     this.scene.start('Game');

        // });
    }
}
