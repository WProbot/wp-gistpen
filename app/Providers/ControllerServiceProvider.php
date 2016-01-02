<?php
namespace Intraxia\Gistpen\Providers;

use Intraxia\Gistpen\Http\SearchController;
use Intraxia\Jaxion\Contract\Core\Container;
use Intraxia\Jaxion\Contract\Core\ServiceProvider;

/**
 * Class ControllerServiceProvider
 *
 * @package Intraxia\Gistpen
 * @subpackage Providers
 */
class ControllerServiceProvider implements ServiceProvider {
	/**
	 * {@inheritdoc}
	 *
	 * @param Container $container
	 */
	public function register( Container $container ) {
		$container->share( array( 'controller.search' => 'Intraxia\Gistpen\Http\SearchController' ), function ( $app ) {
			return new SearchController( $app->fetch( 'database' ), $app->fetch( 'adapter' ) );
		} );
	}
}
