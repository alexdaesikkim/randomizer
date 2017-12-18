var Qualified = React.createClass({
  getInitialState() {
    return {
      player: this.props.player,
      player_qualifiers: this.props.player.playerqualifiers,
      score: this.props.player.qulifier_score
    };
  },
  
  //todo: make sure updating the score updates the actual visuals on the main screen, rather than forcing users to refresh

  render() {

    var handleScoreChange = this.handleScoreChange

    var qualifierform = this.state.player_qualifiers.map( function(playerqualifier) {
      return (
        <Qualifier_Forms playerqualifier={playerqualifier} qualifier={playerqualifier.qualifier} key={"qualifier_song_"+playerqualifier.id} qualified={true} />
      );
    });

    return (
      <div className="card">
        <div className="card-header" role="tab" id= {"qualified_heading_" + this.state.player.id} >
          <h5 className="mb-0">
            <a data-toggle="collapse" data-parent="#accordion" href= {"#qualified_collapse_"+this.state.player.id} aria-expanded="true" aria-controls= {"qualified_collapse_"+this.state.player.id}>
              {this.state.player.name}
            </a>
            &ensp;
            Score: {this.state.player.qualifier_score}
            <span style={{float: 'right'}}>Current Seed: {this.state.player.seed}</span>
          </h5>
        </div>
        <div id= {"qualified_collapse_"+this.state.player.id} className="collapse" role="tabpanel" aria-labelledby= {"qualified_heading_" + this.state.player.id} >
          <div className="card-body">
            {qualifierform}
          </div>
        </div>
      </div>
    );
  }
});
