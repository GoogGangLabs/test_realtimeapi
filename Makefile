### Variable #######################################

DOCKER_COMPOSE_YML  :=  docker-compose.yml
DOCKER_COMPOSE_ENV  :=  .env
DOCKER_COMPOSE      :=  @docker-compose -f $(DOCKER_COMPOSE_YML) --env-file=$(DOCKER_COMPOSE_ENV)

CONTAINER_FLAG      :=  `make ps | wc -l`

### Common #########################################

all: stop

start:
	@if [ $(CONTAINER_FLAG) > 1 ]; then \
		# select yn
	else \
		$(DOCKER_COMPOSE) up --build --detach
	fi

stop:
	$(DOCKER_COMPOSE) stop

mycommand:
	@if $(MAKE) -s restart ; then \
    	     execute_your_command_here ; \
	fi

restart:
	@if [ $(CONTAINER_FLAG) > 1 ]; then \
		REPLY=""; \
		read -p "Container is running, Continue process? [y/n] " -r; \
		if [[ ! $$REPLY =~ ^[Yy]$$ ]]; then \
			echo "NOooooo"; \
			exit 1; \
		else \
			echo "Yessssss"; \
		fi \
	else \
		echo 'none'; \
	fi

### Clean ###########################################

clean: stop
	@(docker rm -f `docker ps -aq` || true) 2> /dev/null

fclean: clean
	@(docker rmi -f `docker images -aq` || true) 2> /dev/null

prune: fclean
	@(yes | docker system prune -a) 2> /dev/null

### Util ############################################

logs:
	$(DOCKER_COMPOSE) logs --follow --timestamps

ps:
	@docker ps

images:
	@docker images

### Phony ###########################################

.PHONY: all up down
.PHONY: clean fclean prune
.PHONY: logs ps images