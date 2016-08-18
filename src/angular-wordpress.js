(function(){
	'use strict';

	angular
		.module( 'ngWordpress', [] )
		.provider( '$wp', $wpProvider );

	function $wpProvider(){

		var isArray     = angular.isArray,
			isDefined   = angular.isDefined,
			isUndefined = angular.isUndefined,
			forEach     = angular.forEach;

		var url       = undefined,
			apiPath   = '/wp-json/wp/v2/',
			menusPath = '/wp-json/wp-api-menus/v2/menu-locations/';

		this.setUrl = function( value ){

			url = value;
		};

		this.$get = [ '$location', '$http', '$log', '$q', function( $location, $http, $log, $q ){

			var $wp = {

				name: undefined,
				tagline: undefined,
				// Using the category 'sticky' and its id because currently the api doesn't support querying the sticky property
				sticky: {
					id: undefined,
					posts: undefined,
				},
				posts: undefined,
				pages: undefined,
				categories: undefined,
				media: undefined,
				comments: undefined,

				menus: {
					primary: undefined,
					social: undefined
				},

				getNameAndTagline: getNameAndTagline,

				get: get,
				getSticky: getSticky,
				getPosts: getPosts,
				getMedia: getMedia,
				getCategories: getCategories,
				getPages: getPages,
				getPost: getPost,
				getComments: getComments,
				getCategoryId: getCategoryId,

				// wp-api-menus plugin required
				getMenus: getMenus
			};

			initialize();

			function initialize(){

				if( isUndefined( url ) ){

					url = $location.host();

					if( isDefined( $location.port() ) ){

						url += $location.port();
					}
				}

				$wp.getNameAndTagline();
			};

			return $wp;

			/**************************************************/
			/****************  PUBLIC METHODS  ****************/
			/**************************************************/
			function getNameAndTagline(){

				if( isDefined( $wp.name ) && isDefined( $wp.tagline ) ){

					return $q.when( { name: $wp.name, tagline: $wp.tagline } );
				}
				else{

					return $http.get( url + '/wp-json' ).then( success, error );
				}

				function success( response ){

					var res = response.data;

					$wp.name 	= res.name;
					$wp.tagline = res.description;

					return { name: $wp.name, tagline: $wp.tagline };
				};

				function error( response ){

				};
			};

			function get( data, options ){

				if( isDefined( options ) ){

					var optionsString = buildOptionsString( options );

					return $http.get( url + apiPath + data + '?' + optionsString ).then( success, error );
				}
				else{

					return $http.get( url + apiPath + data ).then( success, error );
				}

				function success( response ){

					return response.data;
				};

				function error( response ){

					$log.error( 'error getting ' + data + ' [' + response.status + ']: ' + response.data.message );
				};
			};

			function getSticky(){

				if( isDefined( $wp.sticky.posts ) ){

					return $q.when( $wp.sticky.posts );
				}
				else{

					return $wp.getCategoryId( 'sticky' ).then( success );

					function success( stickyId ){

						$wp.sticky.id = stickyId;

						var options = {
						    categories: stickyId.toString()
						};

						return $wp.get( 'posts', options ).then( success );

						function success( posts ){

							$wp.sticky.posts = getMediaForPosts( posts );
							$wp.sticky.posts = getCategoriesForPosts( posts );

							$wp.sticky.posts = posts;

							return $wp.sticky.posts;
						};
					};
				}
			};

			function getPosts( options ){

				if( isDefined( $wp.posts ) ){

					if( isDefined( options ) ){

						var posts = applyPostOptions( $wp.posts, options );
						return $q.when( posts );
					}
					else{

						return $q.when( $wp.posts );
					}
				}
				else{

					return $wp.get( 'posts', options ).then( success );

					function success( posts ){

						$wp.posts = getMediaForPosts( posts );
						$wp.posts = getCategoriesForPosts( posts );
						$wp.posts = removeSticky( posts );

						$wp.posts = posts;
						
						return $wp.posts;
					};
				}
			};

			function getMedia(){

				if( isDefined( $wp.media ) ){

					return $q.when( $wp.media );
				}
				else{

					return $wp.get( 'media' ).then( success );

					function success( media ){

						$wp.media = processResponse( media );
						return $wp.media;
					};
				}
			};

			function getCategories(){

				if( isDefined( $wp.categories ) ){

					return $q.when( $wp.categories );
				}
				else{

					return $wp.get( 'categories' ).then( success );

					function success( categories ){

						$wp.categories = processResponse( categories );
						return $wp.categories;
					};
				}
			};

			function getPages(){

				if( isDefined( $wp.pages ) ){

					return $q.when( $wp.pages );
				}
				else{

					return $wp.get( 'pages' ).then( success );

					function success( pages ){

						$wp.pages = processResponse( pages, 'pages' );
						return $wp.pages;
					};
				}
			};

			function getPost( slug ){

				if( isDefined( $wp.posts ) ){

					return $q.when( $wp.posts.filter( function( post ){

						if( post.slug === slug ){

							return post;
						}

					})[0] );
				}
				else{

					return $wp.getPosts().then( success );

					function success( posts ){

						return $q.when( posts.filter( function( post ){

							if( post.slug === slug ){

								return post;
							}

						})[0] );
					};
				}
			};

			function getComments( id ){

				var comments;

				if( isDefined( $wp.comments ) ){

					comments = getCommentsForPost( $wp.comments, id );
					return $q.when( comments );
				}
				else{

					return $wp.get( 'comments' ).then( success );

					function success( comments ){

						comments = getCommentsForPost( comments, id )
						return $q.when( comments );
					};
				}
			};

			function getCategoryId( category ){

				if( isDefined( $wp.categories ) ){

					var id = filterForId( $wp.categories, category );

					return $q.when( id );
				}
				else{

					return $wp.getCategories().then( success );

					function success( categories ){

						var id = filterForId( categories, category );

						return $q.when( id );
					};
				}

				function filterForId( categories, category ){

					var id;

					forEach( categories, function( value, key ){

						if( value.slug === category ){

							id =  value.id;
						}
					});

					return id;
				}
			};

			function getMenus(){

				if( isDefined( $wp.menus.primary ) || isDefined( $wp.menus.social ) ){

					return $q.when( $wp.menus );
				}
				else{

					return $http.get( url + menusPath + 'primary' ).then( success, error );
				}

				function success( response ){

					$wp.menus.primary = response.data;

					return $http.get( url + menusPath + 'social' ).then( success, error );

					function success( response ){

						$wp.menus.social = response.data;
						return $wp.menus;
					};

					function error( response ){

					};
				};

				function error( response ){

				};
			};

			/**************************************************/
			/**************  PRIVATE FUNCTIONS  ***************/
			/**************************************************/
			function processResponse( response, data ){

				var responseObject = {};

				for( var i=0; i < response.length; i++ ){

					if( data === 'pages' ){

						responseObject[ response[i].slug ] = response[i];
					}
					else{

						responseObject[ response[i].id ] = response[i];
					}
				}

				return responseObject;
			};

			function getMediaForPosts( posts ){
				
				return $wp.getMedia().then( success );

				function success( media ){

					return replaceMedia( posts, media );
				};

				function replaceMedia( posts, media ){

					for( var i=0; i < posts.length; i++ ){

						var post = posts[i];

						post.featured_media = media[ post.featured_media ];
					}

					return posts;
				}
			};

			function getCategoriesForPosts( posts ){

				return $wp.getCategories().then( success );

				function success( categories ){

					return replaceCategories( posts, categories );
				};

				function replaceCategories( posts, categories ){

					for( var i=0; i < posts.length; i++ ){

						var post = posts[i];

						for( var x=0; x < post.categories.length; x++ ){

							post.categories[x] = categories[ post.categories[x] ];
						}
					}

					return posts;
				}
			};

			function getCommentsForPost( comments, id ){

				return comments.filter( function( comment ){

					if( comment.post === id ){

						return comment;
					}
				});
			};

			function buildOptionsString( options ){

				var string = '';

				forEach( options, function( value, key ){

					string += key + '=' + value;
				});

				return string;
			};

			function applyPostOptions( data, options ){

				if( isDefined( options.categories ) ){

					var categories = options.categories.split(',');

					data = data.filter( function( post ){

						for( var i=0; i < post.categories.length; i++ ){

							if( categories.indexOf( post.categories[i].id.toString() ) !== -1 ){

								return post;
							}
						}
					});
				}

				return data;
			};

			function removeSticky( posts ){

				if( isDefined( $wp.sticky.posts ) ){

					posts = remove( posts, $wp.sticky.id );
					return $q.when( posts );
				}

				function remove( posts, id ){

					for( var i = posts.length - 1; i >= 0; i-- ){

						var post = posts[i];

						for( var x=0; x < post.categories.length; x++ ){

							if( post.categories[x] === id ){

								posts.splice( i, 1 );
								continue;
							}
						}
					}

					return posts;
				}		
			};
		}];
	};
})();