import React, {Component} from 'react';
import { Grid, Col, Row } from 'react-bootstrap';
import ProfileCard from '../../components/ProfileCard';
import ProfileRecipeCard from '../../components/ProfileRecipeCard';
import SecondaryNav from '../../components/SecondaryNav';
import API from '../../utils/userAPI';
import './Profile.css';

class Profile extends Component {

    state = {
        path: 'profile',
        id: this.props.match.params.id,
        first: '',
        last: '',
        city: '',
        state: '',
        email: '',
        image: '',
        recipeArr: [],
        followAlert: '',
        showFollowAlert: false,
        alertClass: ''
    }

    componentWillMount() {
        this.loadUser(this.state.id);
    }
    
    loadUser = id => {
        API.getUser(id)
            .then(res => {
                this.setState({
                    first: res.data.name.first,
                    last: res.data.name.last,
                    city: res.data.contact.city,
                    state: res.data.contact.state,
                    email: res.data.contact.email,
                    image: res.data.image,
                    recipeArr: res.data.recipes
                });
            })
            .catch(err => err);
    }

    handleFollowClick = () => {
        const currentBrewerID = sessionStorage.getItem('userID');

        if(!currentBrewerID){
            this.setState({
                followAlert: `Please log in to follow ${this.state.first} ${this.state.last}`,
                showFollowAlert: true,
                alertClass: 'danger'
            })
        } else if(currentBrewerID === this.state.id){
            this.setState({
                followAlert: `Woah take it easy ${this.state.first}, no need to follow yourself`,
                showFollowAlert: true,
                alertClass: 'danger'
            })
        } else {
            this.handleAddFollow(this.state.id)
        }
    }

    handleAddFollow = brewerToFollowID => {
        const currentBrewerID = sessionStorage.getItem('userID')
        // UPDATE THE CURRENT BREWER'S FOLLOWING LIST
        API.updateUser(currentBrewerID, {$addToSet: {'social.following': [brewerToFollowID]}})
        .then(res => {
            if(res.data.updated > 0){
                // UPDATE THE OTHER BREWER'S FOLLOWERS LIST
                API.updateUser(brewerToFollowID, {$addToSet: {'social.followers': [currentBrewerID]}})
                // .then(res => 'success')
                .then(res => {
                    this.setState({
                        followAlert: `Thanks for following ${this.state.first} ${this.state.last}!`,
                        showFollowAlert: true,
                        alertClass: 'success'
                    })
                })
                .catch(err => err);
            } else {
                this.setState({
                    followAlert: `You already follow ${this.state.first} ${this.state.last}`,
                    showFollowAlert: true,
                    alertClass: 'danger'
                })
            }
        })
        .catch(err => err);
    }


    closeFollowAlert = () => {
        this.setState({
            followAlert: '',
            showFollowAlert: false
        })
    }


    render(){
        return(
            <div className='profileBackground'>
                <Grid>
                    <Row>
                        <Col sm={12}>
                            <ProfileCard 
                            userName={this.state.first +  ' ' + this.state.last}
                            location={this.state.city + ', ' + this.state.state}
                            email={this.state.email}
                            img={this.state.image}
                            recipes={this.state.recipes}
                            handleClick={this.handleFollowClick}
                            followAlert={this.state.followAlert}
                            showFollowAlert={this.state.showFollowAlert}
                            closeFollowAlert={this.closeFollowAlert}
                            alertClass={this.state.alertClass}
                            />
                        </Col>
                    </Row>
                    <Row>
                        <Col sm={12}>
                            <SecondaryNav
                            path={this.state.path}
                            iden={this.state.id}
                            />
                        </Col>
                    </Row>
                    <Row>
                    {this.state.recipeArr.map((recipe, i) =>
                        <ProfileRecipeCard 
                            key={`recipe${i}`}
                            id={recipe._id}
                            style={recipe.style}
                            name={recipe.name}
                        />
                    )}
                    </Row>
                </Grid>
            </div>
        );
    }
}



export default Profile;