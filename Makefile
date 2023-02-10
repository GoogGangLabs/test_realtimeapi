### Variable #######################################

DOCKER_COMPOSE_YML  :=  docker-compose.yml
DOCKER_COMPOSE_ENV  :=  .env
DOCKER_COMPOSE      :=  @docker-compose -f $(DOCKER_COMPOSE_YML) --env-file=$(DOCKER_COMPOSE_ENV)

CONTAINER_FLAG      :=  `make ps | wc -l`

_SUCCESS            :=  "\033[32m[%s]\033[0m %s\n"
_WARNING            :=  "\033[33m[%s]\033[0m %s\n"

### Phony ###########################################

.PHONY: all start up down
.PHONY: clean fclean prune
.PHONY: logs ps images

### Common #########################################

all: up

start:
	$(DOCKER_COMPOSE) up --build --detach

up:
	@if [ $(CONTAINER_FLAG) -gt 1 ]; then \
		REPLY=""; \
		read -p "Containers is currently running. Continue process? [y/n] " -r; \
		if [[ ! $$REPLY =~ ^[Yy]$$ ]]; then \
			printf $(_WARNING) "Make worker has down"; \
			exit 0; \
		else \
			printf $(_SUCCESS) "Will be closed existing containers"; \
			make down; \
			printf $(_SUCCESS) "Will be started to build containers"; \
			make start; \
		fi \
	else \
		make start; \
	fi

down:
	$(DOCKER_COMPOSE) down

### Clean ###########################################

clean: down
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
